import { Test } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Payment, PostralPaymentItem, RefundRequest, RefundRequestItem } from '@tk-postral/postral-entities';
import { StartSystemRefundDTO } from '@tk-postral/payment-common';
import { UserAuthBackendDTO } from '@ubs-platform/users-common';
import { RefundService } from './refund.service';
import { PaymentService } from './payment.service';
import { AuthUtilService } from './auth-util.service';
import { EventSenderService } from './event-management.service';

describe('System refunds', () => {
    let service: RefundService;
    let payment: Payment;
    let requests: RefundRequest[];
    const manager = { findOne: jest.fn(), findOneOrFail: jest.fn(), find: jest.fn(), save: jest.fn(), update: jest.fn() };
    const paymentRepo = { manager: { transaction: jest.fn() }, update: jest.fn() };
    const refundRepo = { findOne: jest.fn(), find: jest.fn(), save: jest.fn() };
    const paymentService = { createRefundPayment: jest.fn() };
    const auth = { searchOwnedIds: jest.fn() };
    const channel = { paymentChannelRefund: jest.fn() };
    const dto: StartSystemRefundDTO = {
        paymentId: 'purchase',
        items: [{ paymentItemId: 'book-item', refundCount: 1 }],
        reasonKeys: ['OTHER'],
        requestNote: 'Library access cannot be granted',
        idempotencyKey: 'lotus:purchase:book-item',
    };

    beforeEach(async () => {
        jest.resetAllMocks();
        requests = [];
        payment = Object.assign(new Payment(), {
            id: 'purchase', type: 'PURCHASE', paymentStatus: 'COMPLETED',
            customerAccountId: 'buyer', currency: 'TRY',
            items: [Object.assign(new PostralPaymentItem(), {
                id: 'book-item', itemId: 'book', name: 'Book', quantity: 2,
                unitAmount: 50, totalAmount: 100, unTaxAmount: 80,
                sellerAccountId: 'seller', variation: 'default',
            })],
        });
        manager.findOne.mockImplementation(async (entity, options) => entity === Payment ? payment : refundRepo.findOne(options));
        manager.findOneOrFail.mockImplementation(async (entity, options) => manager.findOne(entity, options));
        manager.find.mockImplementation(async () => refundRepo.find());
        manager.save.mockImplementation(async (entity, record) => entity === RefundRequest && !requests.includes(record)
            ? refundRepo.save(record) : record);
        manager.update.mockImplementation(async (_entity, _id, values) => Object.assign(payment, values));
        paymentRepo.update.mockImplementation(async (where, values) => {
            if (payment.refundApprovalToken === where.refundApprovalToken) {
                Object.assign(payment, values);
            }
        });
        let tail = Promise.resolve();
        paymentRepo.manager.transaction.mockImplementation(action => {
            const result = tail.then(() => action(manager));
            tail = result.then(() => undefined, () => undefined);
            return result;
        });
        refundRepo.findOne.mockImplementation(async options => requests.find(request =>
            options.where.id ? request.id === options.where.id : request.idempotencyKey === options.where.idempotencyKey) ?? null);
        refundRepo.find.mockImplementation(async () => requests.filter(request => request.status !== 'REJECTED'));
        refundRepo.save.mockImplementation(async request => {
            request.id = `refund-${requests.length}`;
            requests.push(request);
            return request;
        });
        paymentService.createRefundPayment.mockResolvedValue({ id: 'refund-payment' });
        const module = await Test.createTestingModule({
            providers: [
                RefundService,
                { provide: getRepositoryToken(Payment), useValue: paymentRepo },
                { provide: getRepositoryToken(RefundRequest), useValue: refundRepo },
                { provide: getRepositoryToken(RefundRequestItem), useValue: {} },
                { provide: getRepositoryToken(PostralPaymentItem), useValue: {} },
                { provide: PaymentService, useValue: paymentService },
                { provide: AuthUtilService, useValue: auth },
                { provide: EventSenderService, useValue: channel },
            ],
        }).compile();
        service = module.get(RefundService);
    });

    it('creates and approves only the selected item without a user or separate legacy channel refund', async () => {
        const result = await service.startRefundMicroservice(dto);
        expect(result).toMatchObject({
            status: 'APPROVED', requestedByAccountId: 'system', resolvedByAccountId: 'system',
            requestedByPaymentAccountId: 'buyer', requestedToPaymentAccountId: 'seller',
            items: [{ paymentItemId: 'book-item', refundCount: 1, refundAmount: 50, refundTaxAmount: 10 }],
        });
        expect(payment.items[0].refundCount).toBe(1);
        expect(auth.searchOwnedIds).not.toHaveBeenCalled();
        expect(channel.paymentChannelRefund).not.toHaveBeenCalled();
        expect(manager.findOne).toHaveBeenCalledWith(Payment, expect.objectContaining({
            loadEagerRelations: false, lock: { mode: 'pessimistic_write' },
        }));
    });

    it('returns the same approved refund on duplicate and concurrent commands', async () => {
        const results = await Promise.allSettled([
            service.startRefundMicroservice(dto), service.startRefundMicroservice(dto),
        ]);
        expect(results.some(result => result.status === 'fulfilled')).toBe(true);
        for (const result of results) {
            if (result.status === 'rejected') {
                expect(result.reason.message).toContain('in progress');
            }
        }
        expect((await service.startRefundMicroservice(dto)).id).toBe(requests[0].id);
        expect(paymentService.createRefundPayment).toHaveBeenCalledTimes(1);
        expect(refundRepo.save).toHaveBeenCalledTimes(1);
        expect(payment.items[0].refundCount).toBe(1);
    });

    it.each(['INITIATED', 'WAITING', 'FAILED'] as const)('rejects %s purchases before creating records', async status => {
        payment.paymentStatus = status;
        await expect(service.startRefundMicroservice(dto)).rejects.toThrow('Can only refund completed payments');
        expect(refundRepo.save).not.toHaveBeenCalled();
        expect(paymentService.createRefundPayment).not.toHaveBeenCalled();
    });

    it('rejects refunds of refund payments and external purchases', async () => {
        payment.type = 'REFUND';
        await expect(service.startRefundMicroservice(dto)).rejects.toThrow('Only PURCHASE');
        payment.type = 'PURCHASE';
        payment.externalPlatformId = 'external';
        await expect(service.startRefundMicroservice(dto)).rejects.toThrow('External platform refunds');
    });

    it.each([0, -1, NaN, Infinity, 0.00001])('rejects invalid quantities %s', async refundCount => {
        await expect(service.startRefundMicroservice({
            ...dto, items: [{ paymentItemId: 'book-item', refundCount }],
        })).rejects.toThrow('positive finite quantities');
        expect(refundRepo.save).not.toHaveBeenCalled();
    });

    it('rejects duplicate items and an empty item selection', async () => {
        await expect(service.startRefundMicroservice({ ...dto, items: [...dto.items, ...dto.items] }))
            .rejects.toThrow('unique payment item IDs');
        await expect(service.startRefundMicroservice({ ...dto, items: [] })).rejects.toThrow('At least one refund item');
    });

    it('rejects reuse of an idempotency key with changed quantities', async () => {
        await service.startRefundMicroservice(dto);
        await expect(service.startRefundMicroservice({
            ...dto, items: [{ paymentItemId: 'book-item', refundCount: 2 }],
        })).rejects.toThrow('different request');
    });

    it('keeps a channel failure pending and resumes the same request', async () => {
        paymentService.createRefundPayment.mockRejectedValueOnce(new Error('Channel unavailable'));
        await expect(service.startRefundMicroservice(dto)).rejects.toThrow('Channel unavailable');
        expect(requests[0].status).toBe('PENDING');
        expect(payment.items[0].refundCount).toBe(0);
        const result = await service.startRefundMicroservice(dto);
        expect(result.status).toBe('APPROVED');
        expect(refundRepo.save).toHaveBeenCalledTimes(1);
    });

    it('reserves pending refund quantities against other commands', async () => {
        paymentService.createRefundPayment.mockRejectedValueOnce(new Error('Channel unavailable'));
        await expect(service.startRefundMicroservice({
            ...dto, items: [{ paymentItemId: 'book-item', refundCount: 2 }],
        })).rejects.toThrow('Channel unavailable');
        await expect(service.startRefundMicroservice({
            ...dto, idempotencyKey: 'another-refund',
        })).rejects.toThrow('already reserved');
    });

    it('rejects a live approval lease but recovers an expired one', async () => {
        payment.refundApprovalToken = 'previous-process';
        payment.refundApprovalExpiresAt = new Date(Date.now() + 60_000);
        await expect(service.startRefundMicroservice(dto)).rejects.toThrow('in progress');
        expect(paymentService.createRefundPayment).not.toHaveBeenCalled();
        payment.refundApprovalExpiresAt = new Date(0);
        expect((await service.startRefundMicroservice(dto)).status).toBe('APPROVED');
        expect(payment.refundApprovalToken).toBeNull();
        expect(refundRepo.save).toHaveBeenCalledTimes(1);
    });

    it('does not finalize after its approval lease was replaced', async () => {
        paymentService.createRefundPayment.mockImplementationOnce(async () => {
            payment.refundApprovalToken = 'replacement-process';
        });
        await expect(service.startRefundMicroservice(dto)).rejects.toThrow('lease changed');
        expect(requests[0].status).toBe('PENDING');
        expect(payment.items[0].refundCount).toBe(0);
        expect(payment.refundApprovalToken).toBe('replacement-process');
    });

    it('keeps different sellers in separate refund requests', async () => {
        payment.items.push(Object.assign(new PostralPaymentItem(), {
            id: 'other-item', sellerAccountId: 'another-seller', quantity: 1,
        }));
        await expect(service.startRefundMicroservice({
            ...dto, items: [...dto.items, { paymentItemId: 'other-item', refundCount: 1 }],
        })).rejects.toThrow('same seller');
        expect(refundRepo.save).not.toHaveBeenCalled();
    });

    it('validates approval notes before creating payments and preserves manual seller authorization', async () => {
        const user = Object.assign(new UserAuthBackendDTO(), { id: 'seller-user' });
        const manual = await service.createRefundRequest(user, dto);
        await expect(service.approveRefundRequest(user, manual.id, { resolutionNote: 'x'.repeat(10001) }))
            .rejects.toThrow('10000');
        expect(paymentService.createRefundPayment).not.toHaveBeenCalled();
        auth.searchOwnedIds.mockResolvedValue(['another-seller']);
        await expect(service.approveRefundRequest(user, manual.id)).rejects.toThrow('EDITOR or OWNER');
        auth.searchOwnedIds.mockResolvedValue(['seller']);
        expect((await service.approveRefundRequest(user, manual.id)).resolvedByAccountId).toBe('seller-user');
    });

    it('allocates the rounding remainder to the final quantity even when refunds are pending', async () => {
        payment.items[0].quantity = 3;
        payment.items[0].totalAmount = 1;
        payment.items[0].unTaxAmount = 1;
        const user = Object.assign(new UserAuthBackendDTO(), { id: 'user' });
        const first = await service.createRefundRequest(user, dto);
        const second = await service.createRefundRequest(user, dto);
        const third = await service.createRefundRequest(user, dto);
        expect([first, second, third].map(request => request.items[0].refundAmount))
            .toEqual([0.3333, 0.3333, 0.3334]);
    });
});
