import { Test } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Account, Payment, PostralPaymentItem, RefundRequest, RefundRequestItem } from '@tk-postral/postral-entities';
import { UserAuthBackendDTO } from '@ubs-platform/users-common';
import { RefundService } from './refund.service';
import { PaymentService } from './payment.service';
import { AuthUtilService } from './auth-util.service';
import { EventSenderService } from './event-management.service';

describe('External platform refund policy', () => {
    let service: RefundService;
    const paymentRepo = { findOne: jest.fn() };
    const refundRepo = { findOne: jest.fn(), save: jest.fn() };
    const paymentService = { createRefundPayment: jest.fn() };
    const user = Object.assign(new UserAuthBackendDTO(), { id: 'user', roles: ['ADMIN'] });

    beforeEach(async () => {
        jest.clearAllMocks();
        const module = await Test.createTestingModule({
            providers: [
                RefundService,
                { provide: getRepositoryToken(Payment), useValue: paymentRepo },
                { provide: getRepositoryToken(RefundRequest), useValue: refundRepo },
                { provide: getRepositoryToken(RefundRequestItem), useValue: {} },
                { provide: getRepositoryToken(PostralPaymentItem), useValue: {} },
                { provide: PaymentService, useValue: paymentService },
                { provide: AuthUtilService, useValue: { searchOwnedIds: async () => ['seller'] } },
                { provide: EventSenderService, useValue: {} },
            ],
        }).compile();
        service = module.get(RefundService);
    });

    it('rejects external refund requests before saving any record', async () => {
        paymentRepo.findOne.mockResolvedValue(Object.assign(new Payment(), {
            id: 'payment', externalPlatformId: 'platform', paymentStatus: 'COMPLETED', type: 'PURCHASE', items: [],
        }));
        await expect(service.createRefundRequest(user, {
            paymentId: 'payment', items: [], reasonKeys: [], requestNote: '',
        })).rejects.toThrow('External platform refunds are not supported yet');
        expect(refundRepo.save).not.toHaveBeenCalled();
        expect(paymentService.createRefundPayment).not.toHaveBeenCalled();
    });

    it('preserves normal refund item validation', async () => {
        paymentRepo.findOne.mockResolvedValue(Object.assign(new Payment(), {
            id: 'payment', paymentStatus: 'COMPLETED', type: 'PURCHASE',
            customerAccount: new Account(),
            items: [Object.assign(new PostralPaymentItem(), { id: 'item', name: 'Item', quantity: 1, refundCount: 0 })],
        }));
        await expect(service.createRefundRequest(user, {
            paymentId: 'payment', items: [{ paymentItemId: 'item', refundCount: 2 }], reasonKeys: [], requestNote: '',
        })).rejects.toThrow('Cannot refund more than purchased quantity');
        expect(refundRepo.save).not.toHaveBeenCalled();
    });

    it('rejects approval of historical external refund requests before channel operations', async () => {
        refundRepo.findOne.mockResolvedValue(Object.assign(new RefundRequest(), {
            id: 'request', paymentId: 'payment', status: 'PENDING', requestedToPaymentAccountId: 'seller', items: [],
        }));
        paymentRepo.findOne.mockResolvedValue(Object.assign(new Payment(), {
            id: 'payment', externalPlatformId: 'platform', paymentStatus: 'COMPLETED', type: 'PURCHASE', items: [],
        }));
        await expect(service.approveRefundRequest(user, 'request')).rejects.toThrow('External platform refunds are not supported yet');
        expect(paymentService.createRefundPayment).not.toHaveBeenCalled();
        expect(refundRepo.save).not.toHaveBeenCalled();
    });
});
