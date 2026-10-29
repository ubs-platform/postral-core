import { Test } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { PaymentChannelOperation } from '@tk-postral/postral-entities';
import { PaymentFullDTO, RefundRequestDTO } from '@tk-postral/payment-common';
import { PaymentOperationManagementService } from './payment-operation-management.service';
import { EventSenderService } from './event-management.service';
import { OrderCalculationService } from './order-calculation.service';
import { AdminSettingsService } from './admin-settings.service';

describe('Refund channel operations', () => {
    let service: PaymentOperationManagementService;
    let operations: PaymentChannelOperation[];
    let previous: PaymentChannelOperation[];
    const purchaseOperations = [
        Object.assign(new PaymentChannelOperation(), {
            id: 'source-a', operationId: 'provider-a', paymentId: 'purchase',
            status: 'COMPLETED', amount: 60, currency: 'TRY', paymentChannelId: 'channel-a',
        }),
        Object.assign(new PaymentChannelOperation(), {
            id: 'source-b', operationId: 'provider-b', paymentId: 'purchase',
            status: 'COMPLETED', amount: 40, currency: 'TRY', paymentChannelId: 'channel-b',
        }),
    ];
    const purchase = Object.assign(new PaymentFullDTO(), {
        id: 'purchase', type: 'PURCHASE', paymentStatus: 'COMPLETED', totalAmount: 100, currency: 'TRY',
    });
    const refund = Object.assign(new PaymentFullDTO(), {
        id: 'refund-payment', type: 'REFUND', paymentStatus: 'WAITING', totalAmount: 25, currency: 'TRY',
    });
    const request = Object.assign(new RefundRequestDTO(), { id: 'request' });
    const manager = { findOneOrFail: jest.fn(), findOne: jest.fn(), save: jest.fn() };
    const repo = { find: jest.fn(), save: jest.fn(), manager: { transaction: jest.fn() } };
    const channel = { initializePaymentChannelOperation: jest.fn() };

    beforeEach(async () => {
        jest.resetAllMocks();
        operations = [];
        previous = [];
        repo.find.mockImplementation(async options => options.where.paymentId === 'purchase' ? purchaseOperations : previous);
        repo.save.mockImplementation(async operation => operation);
        repo.manager.transaction.mockImplementation(async action => action(manager));
        manager.findOne.mockImplementation(async (_entity, options) =>
            operations.find(operation => operation.originalOperationId === options.where.originalOperationId) ?? null);
        manager.save.mockImplementation(async (_entity, operation) => {
            operation.id = `refund-op-${operations.length}`;
            operations.push(operation);
            return operation;
        });
        channel.initializePaymentChannelOperation.mockImplementation(async (id, dto) => ({
            paymentChannelId: id, paymentChannelOperationId: dto.refundOperationId, paymentStatus: 'WAITING',
        }));
        const module = await Test.createTestingModule({
            providers: [
                PaymentOperationManagementService,
                { provide: getRepositoryToken(PaymentChannelOperation), useValue: repo },
                { provide: EventSenderService, useValue: channel },
                { provide: OrderCalculationService, useValue: {} },
                { provide: AdminSettingsService, useValue: { getAdminSettings: async () => ({ sellerPaysPaymentServiceFee: false }) } },
            ],
        }).compile();
        service = module.get(PaymentOperationManagementService);
    });

    it('allocates only the requested amount and references each original provider operation', async () => {
        await service.startRefundPaymentOperationsForRefundRequest(request, refund, purchase);
        expect(operations.map(operation => operation.amount)).toEqual([15, 10]);
        expect(channel.initializePaymentChannelOperation).toHaveBeenNthCalledWith(1, 'channel-a', expect.objectContaining({
            totalAmount: 25, originalPaymentChannelOperationId: 'provider-a', refundOperationId: 'refund-op-0',
            captureInfo: { paymentChannelId: 'channel-a', paidAmount: 15, currency: 'TRY' },
        }));
        expect(channel.initializePaymentChannelOperation).toHaveBeenNthCalledWith(2, 'channel-b', expect.objectContaining({
            originalPaymentChannelOperationId: 'provider-b',
            captureInfo: { paymentChannelId: 'channel-b', paidAmount: 10, currency: 'TRY' },
        }));
    });

    it('does not reinitialize channels after a successful attempt', async () => {
        await service.startRefundPaymentOperationsForRefundRequest(request, refund, purchase);
        await service.startRefundPaymentOperationsForRefundRequest(request, refund, purchase);
        expect(channel.initializePaymentChannelOperation).toHaveBeenCalledTimes(2);
        expect(operations).toHaveLength(2);
    });

    it('reserves an ambiguous channel call and refuses to issue it a second time', async () => {
        channel.initializePaymentChannelOperation.mockRejectedValueOnce(new Error('Timeout'));
        await expect(service.startRefundPaymentOperationsForRefundRequest(request, refund, purchase)).rejects.toThrow('Timeout');
        expect(operations[0].operationId).toBeUndefined();
        await expect(service.startRefundPaymentOperationsForRefundRequest(request, refund, purchase))
            .rejects.toThrow('needs reconciliation');
        expect(channel.initializePaymentChannelOperation).toHaveBeenCalledTimes(1);
    });

    it('does not approve a channel response marked FAILED', async () => {
        channel.initializePaymentChannelOperation.mockResolvedValueOnce({
            paymentChannelId: 'channel-a', paymentChannelOperationId: 'failed-op', paymentStatus: 'FAILED',
        });
        await expect(service.startRefundPaymentOperationsForRefundRequest(request, refund, purchase)).rejects.toThrow('failed');
        expect(operations[0].status).toBe('FAILED');
    });

    it('respects amounts already reserved by another refund', async () => {
        previous.push(Object.assign(new PaymentChannelOperation(), { originalOperationId: 'source-a', amount: 60 }));
        await service.startRefundPaymentOperationsForRefundRequest(request, refund, purchase);
        expect(operations.map(operation => operation.amount)).toEqual([25]);
        expect(operations[0].originalOperationId).toBe('source-b');
    });

    it('keeps four-decimal allocation totals exact', async () => {
        const smallRefund = { ...refund, totalAmount: 0.0001 };
        await service.startRefundPaymentOperationsForRefundRequest(request, smallRefund, purchase);
        expect(operations.map(operation => operation.amount)).toEqual([0.0001]);
    });

    it('forwards opaque plans to the matching channel without applying provider policies', async () => {
        const plans = [
            { originalOperationId: 'source-a', originalChannelOperationId: 'provider-a',
                channelData: { providerPolicy: 'custom-a' },
                lines: [{ originalPaymentItemId: 'original', nominalAmount: '15.0000', providerAmount: '15.0000' }] },
            { originalOperationId: 'source-b', originalChannelOperationId: 'provider-b',
                channelData: { providerPolicy: 'custom-b' },
                lines: [{ originalPaymentItemId: 'original', nominalAmount: '10.0000', providerAmount: '10.0000' }] },
        ];
        channel.initializePaymentChannelOperation.mockImplementation(async (id, dto) => ({
            paymentChannelId: id, paymentChannelOperationId: dto.refundOperationId,
            paymentStatus: 'WAITING', refundSettlements: [],
        }));
        manager.findOneOrFail.mockImplementation(async (entity, options) => entity === PaymentChannelOperation
            ? operations.find(operation => operation.id === options.where.id)
            : {});
        manager.save.mockImplementation(async (_entity, operation) => {
            if (!operation.id) {
                operation.id = `refund-op-${operations.length}`;
                operations.push(operation);
            }
            return operation;
        });
        await service.startRefundPaymentOperationsForRefundRequest(request, refund, purchase, plans);
        expect(channel.initializePaymentChannelOperation).toHaveBeenNthCalledWith(1, 'channel-a',
            expect.objectContaining({ refundPlan: plans[0] }));
        expect(channel.initializePaymentChannelOperation).toHaveBeenNthCalledWith(2, 'channel-b',
            expect.objectContaining({ refundPlan: plans[1] }));
        expect(operations.map(operation => operation.refundPlan)).toEqual(plans);
    });

    it('reads legacy single plans and refuses mismatched nominal allocations before sending', async () => {
        const plan = {
            originalOperationId: 'source-a', originalChannelOperationId: 'provider-a',
            lines: [{ originalPaymentItemId: 'original', nominalAmount: '25.0000', providerAmount: '25.00' }],
        };
        await expect(service.startRefundPaymentOperationsForRefundRequest(request, refund, purchase, plan))
            .rejects.toThrow('does not match');
        expect(channel.initializePaymentChannelOperation).not.toHaveBeenCalled();
    });

    it('rejects refunds without completed captures and refunds exceeding remaining captures', async () => {
        repo.find.mockResolvedValueOnce([]);
        await expect(service.startRefundPaymentOperationsForRefundRequest(request, refund, purchase))
            .rejects.toThrow('Completed payment channel operations');
        await expect(service.startRefundPaymentOperationsForRefundRequest(request, { ...refund, totalAmount: 101 }, purchase))
            .rejects.toThrow('remaining captured');
        expect(channel.initializePaymentChannelOperation).not.toHaveBeenCalled();
    });
});
