import { Test } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Account, AccountPaymentTransaction, Payment, PaymentChannelOperation } from '@tk-postral/postral-entities';
import { PaymentChannelStatusDTO, PaymentFullDTO, RefundChannelPlan, RefundRequestDTO } from '@tk-postral/payment-common';
import { PaymentOperationManagementService } from './payment-operation-management.service';
import { EventSenderService } from './event-management.service';
import { OrderCalculationService } from './order-calculation.service';
import { AdminSettingsService } from './admin-settings.service';

describe('Channel-independent refund preparation and accounting', () => {
    let service: PaymentOperationManagementService;
    let operation: PaymentChannelOperation;
    let transactions: AccountPaymentTransaction[];
    const repo = { find: jest.fn(), manager: { transaction: jest.fn(), findOneBy: jest.fn() } };
    const manager = { findOneOrFail: jest.fn(), findBy: jest.fn(), save: jest.fn() };
    const settings = { getAdminSettings: jest.fn() };
    const channel = { prepareChannelRefund: jest.fn() };
    const source = Object.assign(new PaymentChannelOperation(), {
        id: 'source', operationId: 'adapter-source', paymentId: 'purchase',
        paymentChannelId: 'test-provider', operationType: 'PURCHASE', status: 'COMPLETED', amount: 10, currency: 'TRY',
    });
    const purchase = Object.assign(new PaymentFullDTO(), {
        id: 'purchase', type: 'PURCHASE', paymentStatus: 'COMPLETED', currency: 'TRY',
        totalAmount: 10, customerAccountId: 'customer',
        items: [{ id: 'original-item', totalAmount: 10 }],
    });
    const request = Object.assign(new RefundRequestDTO(), {
        id: 'request', items: [{ paymentItemId: 'original-item', refundAmount: 3.3333 }],
    });
    const plan: RefundChannelPlan = {
        originalOperationId: 'source', originalChannelOperationId: 'adapter-source',
        channelData: { providerPolicy: 'opaque-to-core' }, roundingAccountId: 'platform',
        lines: [{ originalPaymentItemId: 'original-item', nominalAmount: '3.3333', providerAmount: '3.33' }],
    };
    const result = (): PaymentChannelStatusDTO => ({
        paymentChannelId: 'test-provider', paymentChannelOperationId: 'adapter-refund-op',
        paymentStatus: 'COMPLETED', redirectUrl: '',
        refundSettlements: [{ originalPaymentItemId: 'original-item', providerAmount: '3.33' }],
    });

    beforeEach(async () => {
        jest.resetAllMocks();
        transactions = [];
        operation = Object.assign(new PaymentChannelOperation(), {
            id: 'refund-op', paymentId: 'refund-payment', operationType: 'REFUND',
            paymentChannelId: 'test-provider', currency: 'TRY', amount: 3.3333,
            refundPlan: structuredClone(plan),
        });
        repo.find.mockImplementation(async options => options.where.operationType === 'PURCHASE' ? [source] : []);
        repo.manager.findOneBy.mockResolvedValue({ id: 'platform', type: 'COMMERCIAL', deactivated: false, isExternal: false });
        repo.manager.transaction.mockImplementation(action => action(manager));
        manager.findOneOrFail.mockImplementation(async entity => {
            if (entity === PaymentChannelOperation) return structuredClone(operation);
            return { id: 'refund-payment', customerAccountId: 'customer' };
        });
        manager.findBy.mockResolvedValue([{ id: 'customer', name: 'Customer' }, { id: 'platform', name: 'Platform' }]);
        manager.save.mockImplementation(async (entity, value) => {
            if (entity === PaymentChannelOperation) operation = value;
            if (entity === AccountPaymentTransaction) transactions.push(...value);
            return value;
        });
        settings.getAdminSettings.mockResolvedValue({ billingAccountId: 'platform' });
        channel.prepareChannelRefund.mockResolvedValue({ plans: [structuredClone(plan)] });
        const module = await Test.createTestingModule({
            providers: [
                PaymentOperationManagementService,
                { provide: getRepositoryToken(PaymentChannelOperation), useValue: repo },
                { provide: EventSenderService, useValue: channel },
                { provide: OrderCalculationService, useValue: {} },
                { provide: AdminSettingsService, useValue: settings },
            ],
        }).compile();
        service = module.get(PaymentOperationManagementService);
    });

    it('asks the selected channel to prepare original lines and preserves its opaque policy', async () => {
        expect(await service.prepareRefundChannelPlan(request, purchase)).toEqual([plan]);
        expect(channel.prepareChannelRefund).toHaveBeenCalledWith('test-provider', {
            purchasePaymentId: 'purchase', purchaseAmount: 10, currency: 'TRY',
            captures: [{ originalOperationId: 'source', originalChannelOperationId: 'adapter-source',
                paymentChannelId: 'test-provider', amount: 10 }],
            items: [{ originalPaymentItemId: 'original-item', nominalAmount: '3.3333' }],
        });
    });

    it('propagates channel eligibility errors and rejects missing platform rounding accounts before payment creation', async () => {
        channel.prepareChannelRefund.mockRejectedValueOnce(new Error('Channel does not support this capture arrangement'));
        await expect(service.prepareRefundChannelPlan(request, purchase)).rejects.toThrow('capture arrangement');
        settings.getAdminSettings.mockResolvedValue({});
        await expect(service.prepareRefundChannelPlan(request, purchase)).rejects.toThrow('billing account');
        expect(manager.save).not.toHaveBeenCalled();
    });

    it('needs no rounding account for matching provider amounts and supports amount-only channels', async () => {
        settings.getAdminSettings.mockResolvedValue({});
        const exact = { ...request, items: [{ ...request.items[0], refundAmount: 3.33 }] };
        channel.prepareChannelRefund.mockResolvedValueOnce({ plans: [{
            ...plan, lines: [{ ...plan.lines[0], nominalAmount: '3.3300' }],
        }] });
        expect((await service.prepareRefundChannelPlan(exact, purchase))[0].roundingAccountId).toBeUndefined();
        channel.prepareChannelRefund.mockResolvedValueOnce({ plans: [] });
        expect(await service.prepareRefundChannelPlan(request, purchase)).toEqual([]);
    });

    it('supports multiple capture channels without provider-specific branching', async () => {
        repo.find.mockResolvedValue([{ ...source, amount: 6 }, {
            ...source, id: 'other-source', operationId: 'other-adapter-source',
            paymentChannelId: 'another-provider', amount: 4,
        }]);
        channel.prepareChannelRefund.mockResolvedValue({ plans: [] });
        expect(await service.prepareRefundChannelPlan(request, purchase)).toEqual([]);
        expect(channel.prepareChannelRefund.mock.calls.map(call => call[0])).toEqual(['test-provider', 'another-provider']);
    });

    it.each([
        { plans: [{ ...plan, originalOperationId: 'foreign' }] },
        { plans: [{ ...plan, lines: [{ ...plan.lines[0], providerAmount: 'NaN' }] }] },
        { plans: [{ ...plan, lines: [{ ...plan.lines[0], nominalAmount: '4.0000' }] }] },
        { plans: [{ ...plan, lines: [{ ...plan.lines[0], nominalAmount: '3.0000' }] }] },
        { plans: [plan, plan] },
        {},
        null,
    ])('rejects invalid channel preparation without financial writes', async response => {
        channel.prepareChannelRefund.mockResolvedValueOnce(response);
        await expect(service.prepareRefundChannelPlan(request, purchase)).rejects.toThrow('Channel');
        expect(manager.save).not.toHaveBeenCalled();
    });

    it('selects the platform account in core instead of trusting an adapter-selected counterparty', async () => {
        channel.prepareChannelRefund.mockResolvedValueOnce({ plans: [{ ...plan, roundingAccountId: 'foreign-account' }] });
        expect((await service.prepareRefundChannelPlan(request, purchase))[0].roundingAccountId).toBe('platform');
        expect(repo.manager.findOneBy).toHaveBeenCalledWith(Account, { id: 'platform' });
    });

    it('preserves generic READY statuses, provider operation IDs and fee metadata for planned refunds', async () => {
        await service.savePaymentChannelRecord(operation, {
            ...result(), paymentStatus: 'READY', refundSettlements: [], providerFee: 0.01, feeCutInstantly: false,
        }, 'refund-payment');
        expect(operation).toMatchObject({
            status: 'READY', operationId: 'adapter-refund-op',
            providerFee: 0.01, feeCutInstantly: false, providerFeeDebitFrom: 'PLATFORM',
        });
        expect(transactions).toEqual([]);
    });

    it('posts the signed difference as a balanced, tax-free customer/platform pair exactly once', async () => {
        await service.savePaymentChannelRecord(operation, result(), 'refund-payment');
        await service.savePaymentChannelRecord(operation, result(), 'refund-payment');
        expect(operation.amount).toBe(3.3333);
        expect(operation.status).toBe('COMPLETED');
        expect(transactions).toHaveLength(2);
        expect(transactions).toEqual([
            expect.objectContaining({ accountId: 'customer', type: 'DEBIT', amount: 0.0033, taxAmount: 0, roundingOperationId: 'refund-op' }),
            expect.objectContaining({ accountId: 'platform', type: 'CREDIT', amount: 0.0033, taxAmount: 0, roundingOperationId: 'refund-op' }),
        ]);
        expect(transactions[0].corelationId).toBe(transactions[1].corelationId);
        expect(operation.settledRefundItemIds).toEqual(['original-item']);
        expect(manager.findOneOrFail).toHaveBeenCalledWith(PaymentChannelOperation, expect.objectContaining({ lock: { mode: 'pessimistic_write' } }));
    });

    it('reverses the accounting direction for upward rounding', async () => {
        operation.refundPlan!.lines[0].providerAmount = '3.34';
        const response = result();
        response.refundSettlements![0].providerAmount = '3.34';
        await service.savePaymentChannelRecord(operation, response, 'refund-payment');
        expect(transactions).toEqual([
            expect.objectContaining({ accountId: 'customer', type: 'CREDIT', amount: 0.0067 }),
            expect.objectContaining({ accountId: 'platform', type: 'DEBIT', amount: 0.0067 }),
        ]);
    });

    it('records only successful lines of a pending refund and does not post an ambiguous amount', async () => {
        const pending = result();
        pending.paymentStatus = 'WAITING';
        pending.refundSettlements = [];
        await service.savePaymentChannelRecord(operation, pending, 'refund-payment');
        expect(transactions).toHaveLength(0);
        pending.refundSettlements = result().refundSettlements;
        await service.savePaymentChannelRecord(operation, pending, 'refund-payment');
        expect(transactions).toHaveLength(2);
        expect(operation.status).toBe('WAITING');
    });

    it('rejects mismatched/missing/duplicate settlements and never treats them as completed', async () => {
        const missing = result();
        missing.refundSettlements = [];
        await expect(service.savePaymentChannelRecord(operation, missing, 'refund-payment')).rejects.toThrow('Invalid');
        const wrong = result();
        wrong.refundSettlements![0].providerAmount = '3.34';
        await expect(service.savePaymentChannelRecord(operation, wrong, 'refund-payment')).rejects.toThrow('mismatch');
        const duplicate = result();
        duplicate.refundSettlements!.push(...duplicate.refundSettlements!);
        await expect(service.savePaymentChannelRecord(operation, duplicate, 'refund-payment')).rejects.toThrow('Invalid');
        expect(transactions).toHaveLength(0);
        expect(operation.status).toBe('WAITING');
    });

    it('does not allow a stale status response to regress a completed refund', async () => {
        await service.savePaymentChannelRecord(operation, result(), 'refund-payment');
        const stale = result();
        stale.paymentStatus = 'WAITING';
        await expect(service.savePaymentChannelRecord(operation, stale, 'refund-payment')).rejects.toThrow('cannot regress');
        expect(transactions).toHaveLength(2);
        expect(operation.status).toBe('COMPLETED');
    });
});
