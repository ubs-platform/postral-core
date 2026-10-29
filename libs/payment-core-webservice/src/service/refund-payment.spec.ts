import { Test } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Payment, PostralPaymentItem, RefundRequest } from '@tk-postral/postral-entities';
import { PaymentFullDTO, RefundChannelPlan, RefundRequestDTO } from '@tk-postral/payment-common';
import { PaymentService } from './payment.service';
import { PaymentMapper } from '../mapper/payment.mapper';
import { PaymentItemMapper } from '../mapper/payment-item.mapper';
import { PaymentTaxMapper } from '../mapper/payment-tax.mapper';
import { TransactionMapper } from '../mapper/transaction.mapper';
import { InvoiceAccountMapper } from '../mapper/invoice-account.mapper';
import { InvoiceAddressMapper } from '../mapper/invoice-address.mapper';
import { EventSenderService } from './event-management.service';
import { SellerPaymentOrderService } from './seller-payment-order.service';
import { AccountService } from './account.service';
import { OrderCalculationService } from './order-calculation.service';
import { PaymentOperationManagementService } from './payment-operation-management.service';
import { AccountPaymentTransactionService } from './account-payment-transaction.service';
import { ReportDigestionService } from './report-digestion.service';
import { PaymentCommonService } from './payment-common.service';
import { WebhookDispatchService } from './webhook-dispatch.service';
import { AddressService } from './address.service';

describe('Refund payment persistence', () => {
    let service: PaymentService;
    let savedPayment: Payment | null;
    let savedPlan: RefundChannelPlan[] | undefined;
    const original = Object.assign(new Payment(), {
        id: 'purchase', type: 'PURCHASE', paymentStatus: 'COMPLETED',
        customerAccountId: 'buyer', currency: 'TRY',
        items: [Object.assign(new PostralPaymentItem(), {
            id: 'book-item', itemId: 'book', quantity: 2, unitAmount: 60,
            originalUnitAmount: 60, totalAmount: 120, taxAmount: 20,
            unTaxAmount: 100, taxPercent: 20, variation: 'default', appComissionAmount: 12,
            sellerAccountId: 'seller', entityGroup: 'LOTUS_QB', entityName: 'QUESTION_BOOK', entityId: 'book',
            isPhysical: true, metaEntityGroup: 'CATALOG', metaEntityName: 'BOOK', metaEntityId: 'edition',
        })],
    });
    const request = Object.assign(new RefundRequestDTO(), {
        id: 'request', paymentId: 'purchase', status: 'PENDING',
        items: [{ paymentItemId: 'book-item', refundCount: 1, refundAmount: 60, refundTaxAmount: 10, refundAmountWithoutTax: 50 }],
    });
    const manager = { findOne: jest.fn(), findOneOrFail: jest.fn(), save: jest.fn(), update: jest.fn() };
    const repo = { exists: jest.fn(), save: jest.fn(), manager: { transaction: jest.fn() } };
    const calculations = { calculateTotalAmount: jest.fn() };
    const accounts = { fetchOne: jest.fn() };
    const common = { findPaymentByIdRaw: jest.fn(), findPaymentById: jest.fn() };
    const channels = {
        startRefundPaymentOperationsForRefundRequest: jest.fn(), prepareRefundChannelPlan: jest.fn(),
        checkAndUpdateOperationStatuses: jest.fn(), totalPaidOrAuthorizedOf: jest.fn(), firePaymentOperationsByPaymentId: jest.fn(),
    };
    const orders = { addSellerPaymentOrders: jest.fn() };
    const transactions = { fromPayment: jest.fn() };

    beforeEach(async () => {
        jest.resetAllMocks();
        savedPayment = null;
        savedPlan = undefined;
        repo.exists.mockImplementation(async () => savedPayment !== null);
        repo.manager.transaction.mockImplementation(async action => action(manager));
        manager.findOne.mockImplementation(async entity => entity === RefundRequest
            ? Object.assign(new RefundRequest(), { id: 'request', status: 'PENDING', channelRefundPlan: savedPlan }) : savedPayment);
        manager.update.mockImplementation(async (_entity, _id, values) => { savedPlan = values.channelRefundPlan; });
        repo.save.mockImplementation(async payment => payment);
        manager.save.mockImplementation(async (_entity, payment: Payment) => {
            payment.id = 'refund-payment';
            savedPayment = payment;
            return payment;
        });
        manager.findOneOrFail.mockImplementation(async () => savedPayment);
        common.findPaymentByIdRaw.mockResolvedValue(original);
        common.findPaymentById.mockImplementation(async id => id === 'purchase' ? original : savedPayment);
        accounts.fetchOne.mockResolvedValue({ id: 'buyer', defaultAddressId: 'address' });
        const module = await Test.createTestingModule({
            providers: [
                PaymentService,
                { provide: getRepositoryToken(Payment), useValue: repo },
                { provide: PaymentMapper, useValue: {
                    toDto: (payment: Payment) => Object.assign(new PaymentFullDTO(), payment),
                    toFullDto: (payment: Payment) => Object.assign(new PaymentFullDTO(), payment),
                } },
                PaymentItemMapper,
                { provide: PaymentTaxMapper, useValue: { toEntity: tax => tax } },
                { provide: EventSenderService, useValue: {} },
                { provide: SellerPaymentOrderService, useValue: orders },
                { provide: AccountService, useValue: accounts },
                { provide: OrderCalculationService, useValue: calculations },
                { provide: PaymentOperationManagementService, useValue: channels },
                { provide: AccountPaymentTransactionService, useValue: transactions },
                { provide: ReportDigestionService, useValue: {} },
                { provide: TransactionMapper, useValue: { fromPaymentItem: jest.fn(() => ({})) } },
                { provide: PaymentCommonService, useValue: common },
                { provide: WebhookDispatchService, useValue: {} },
                { provide: AddressService, useValue: {} },
                { provide: InvoiceAccountMapper, useValue: {} },
                { provide: InvoiceAddressMapper, useValue: {} },
            ],
        }).compile();
        service = module.get(PaymentService);
        jest.spyOn(service, 'applyItemSellerSnapshots').mockResolvedValue(undefined);
        jest.spyOn(service, 'applyAccountSnapshot').mockResolvedValue(undefined);
        jest.spyOn(service, 'applyAddressSnapshot').mockResolvedValue(undefined);
    });

    it('uses historical amounts, tax rates and commissions instead of current item prices', async () => {
        const result = await service.createRefundPayment(request);
        expect(result).toMatchObject({
            type: 'REFUND', totalAmount: 60, taxAmount: 10, paymentStatus: 'WAITING',
            items: [{
                originalPaymentItemId: 'book-item',
                quantity: 1, totalAmount: 60, taxAmount: 10, taxPercent: 20, unTaxAmount: 50, appComissionAmount: 6,
                isPhysical: true, metaEntityGroup: 'CATALOG', metaEntityName: 'BOOK', metaEntityId: 'edition',
            }],
        });
        expect(calculations.calculateTotalAmount).not.toHaveBeenCalled();
        expect(result.items[0].id).toBeUndefined();
        expect(original.items[0].originalPaymentItemId).toBeUndefined();
        expect(channels.startRefundPaymentOperationsForRefundRequest).toHaveBeenCalledWith(
            request, expect.objectContaining({ items: [expect.objectContaining({ originalPaymentItemId: 'book-item' })] }),
            expect.anything(), undefined,
        );
        expect(orders.addSellerPaymentOrders).toHaveBeenCalledWith(expect.any(Array), manager);
        expect(transactions.fromPayment).toHaveBeenCalledWith(expect.objectContaining({ totalAmount: 60 }), manager);
    });

    it('resumes an existing refund payment without duplicating payment or ledger records', async () => {
        await service.createRefundPayment(request);
        await service.createRefundPayment(request);
        expect(manager.save).toHaveBeenCalledTimes(1);
        expect(orders.addSellerPaymentOrders).toHaveBeenCalledTimes(1);
        expect(transactions.fromPayment).toHaveBeenCalledTimes(1);
        expect(savedPayment?.items[0].originalPaymentItemId).toBe('book-item');
    });

    it('retains the saved payment when a channel fails so retry does not create a second one', async () => {
        channels.startRefundPaymentOperationsForRefundRequest.mockRejectedValueOnce(new Error('Channel unavailable'));
        await expect(service.createRefundPayment(request)).rejects.toThrow('Channel unavailable');
        await service.createRefundPayment(request);
        expect(manager.save).toHaveBeenCalledTimes(1);
    });

    it('persists and reuses the original rounding plan without recalculation on resume', async () => {
        const plan: RefundChannelPlan = {
            originalOperationId: 'original-op', originalChannelOperationId: 'adapter-op', channelData: { policy: 'saved' },
            lines: [{ originalPaymentItemId: 'book-item', nominalAmount: '60.0000', providerAmount: '60.00' }],
        };
        channels.prepareRefundChannelPlan.mockResolvedValueOnce([plan]);
        await service.createRefundPayment(request);
        await service.createRefundPayment(request);
        expect(channels.prepareRefundChannelPlan).toHaveBeenCalledTimes(1);
        expect(manager.update).toHaveBeenCalledWith(RefundRequest, 'request', { channelRefundPlan: [plan] });
        expect(channels.startRefundPaymentOperationsForRefundRequest).toHaveBeenLastCalledWith(
            request, expect.anything(), expect.anything(), [plan],
        );
    });

    it('fails predictable channel precision validation before payment and accounting creation', async () => {
        channels.prepareRefundChannelPlan.mockRejectedValueOnce(new Error('Channel rejected refund precision'));
        await expect(service.createRefundPayment(request)).rejects.toThrow('precision');
        expect(manager.save).not.toHaveBeenCalled();
        expect(transactions.fromPayment).not.toHaveBeenCalled();
        expect(channels.startRefundPaymentOperationsForRefundRequest).not.toHaveBeenCalled();
    });

    it('completes a synchronously settled refund through the existing checker once', async () => {
        await service.createRefundPayment(request);
        common.findPaymentByIdRaw.mockImplementation(async () => savedPayment);
        channels.totalPaidOrAuthorizedOf.mockResolvedValue(60);
        const completed = jest.spyOn(service, 'onPaymentCompleted').mockResolvedValue(undefined);
        expect(await service.updatePaymentByOperationStatuses('refund-payment', true)).toMatchObject({
            type: 'REFUND', paymentStatus: 'COMPLETED', totalAmount: 60,
        });
        await service.updatePaymentByOperationStatuses('refund-payment', true);
        expect(channels.checkAndUpdateOperationStatuses).toHaveBeenCalledTimes(1);
        expect(completed).toHaveBeenCalledTimes(1);
    });
});
