import { IyzicoRefundService } from './iyzico-refund.service';
import { IyzicoRefund } from './iyzico-refund.entity';
import { IyzicoOperation } from './iyzico-operation.entity';
import { IyzicoClientService, IyzicoRefundRejectedError } from './iyzico-client.service';
import { Test } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import type { PaymentFullWithCaptureInfoDTO, PrepareChannelRefundDTO } from '@tk-postral/payment-common';

function payment(): PaymentFullWithCaptureInfoDTO {
    return {
        id: 'refund-payment', type: 'REFUND', currency: 'TRY',
        totalAmount: 6.6666, taxAmount: 0, customerAccountId: 'buyer',
        paymentChannelId: 'iyzico', paymentStatus: 'WAITING', errorStatus: undefined,
        items: [], taxes: [], refundOperationId: 'refund-id',
        originalPaymentChannelOperationId: 'source',
        captureInfo: { paymentChannelId: 'iyzico', currency: 'TRY', paidAmount: 6.6666 },
        refundPlan: {
            originalOperationId: 'core-source', originalChannelOperationId: 'source',
            channelData: { roundingMode: 'ROUND' },
            lines: [
                { originalPaymentItemId: 'a', nominalAmount: '3.3333', providerAmount: '3.33' },
                { originalPaymentItemId: 'b', nominalAmount: '3.3333', providerAmount: '3.33' },
            ],
        },
    };
}

describe('Durable iyzico refunds', () => {
    let service: IyzicoRefundService;
    let source: IyzicoOperation;
    const rows = new Map<string, IyzicoRefund>();
    const manager = { findOne: jest.fn(), find: jest.fn(), insert: jest.fn() };
    const repo = { findOneBy: jest.fn(), update: jest.fn(), manager: { transaction: jest.fn(), findOne: jest.fn() } };
    const client = { refund: jest.fn() };
    let transactionTail: Promise<void>;
    const originalEnv = process.env.IYZICO_REFUND_ROUNDING_MODE;

    async function createService() {
        const module = await Test.createTestingModule({
            providers: [
                IyzicoRefundService,
                { provide: getRepositoryToken(IyzicoRefund), useValue: repo },
                { provide: IyzicoClientService, useValue: client },
            ],
        }).compile();
        return module.get(IyzicoRefundService);
    }

    beforeEach(async () => {
        jest.resetAllMocks();
        process.env.IYZICO_REFUND_ROUNDING_MODE = 'ROUND';
        rows.clear();
        transactionTail = Promise.resolve();
        source = Object.assign(new IyzicoOperation(), {
            id: 'source', paymentId: 'purchase', amount: '20.00', currency: 'TRY',
            status: 'COMPLETED', providerPaymentId: 'provider-payment',
            itemTransactions: [
                { paymentItemId: 'a', paymentTransactionId: 'txn-a', price: '10', paidPrice: '10' },
                { paymentItemId: 'b', paymentTransactionId: 'txn-b', price: '10', paidPrice: '10' },
            ],
        });
        manager.findOne.mockImplementation(async (entity, options) => entity === IyzicoOperation
            ? (options.where.id === source.id ? source : null)
            : structuredClone(rows.get(options.where.id) ?? null));
        repo.manager.findOne.mockImplementation(manager.findOne);
        manager.find.mockImplementation(async () => [...rows.values()].map(row => structuredClone(row)));
        manager.insert.mockImplementation(async (_entity, row) => rows.set(row.id, structuredClone(row)));
        repo.findOneBy.mockImplementation(async ({ id }) => structuredClone(rows.get(id) ?? null));
        repo.update.mockImplementation(async (criteria, changes) => {
            const id = typeof criteria === 'string' ? criteria : criteria.id;
            const row = rows.get(id);
            if (!row || (typeof criteria !== 'string' && criteria.state && row.state !== criteria.state)) {
                return { affected: 0 };
            }
            rows.set(id, { ...row, ...structuredClone(changes) });
            return { affected: 1 };
        });
        repo.manager.transaction.mockImplementation(action => {
            const result = transactionTail.then(() => action(manager));
            transactionTail = result.then(() => undefined, () => undefined);
            return result;
        });
        client.refund.mockImplementation(async request => {
            expect(rows.get('refund-id')?.state).toBe('SUBMITTING');
            expect(rows.get('refund-id')?.lines.find(line => line.conversationId === request.conversationId)?.state).toBe('SUBMITTING');
            return { refundHostReference: `ref-${request.paymentTransactionId}` };
        });
        service = await createService();
    });

    afterEach(() => {
        if (originalEnv === undefined) delete process.env.IYZICO_REFUND_ROUNDING_MODE;
        else process.env.IYZICO_REFUND_ROUNDING_MODE = originalEnv;
    });

    function preparation(): PrepareChannelRefundDTO {
        return {
            purchasePaymentId: 'purchase', purchaseAmount: 20, currency: 'TRY',
            captures: [{ originalOperationId: 'core-source', originalChannelOperationId: 'source',
                paymentChannelId: 'iyzico', amount: 20 }],
            items: payment().refundPlan!.lines.map(({ originalPaymentItemId, nominalAmount }) =>
                ({ originalPaymentItemId, nominalAmount })),
        };
    }

    it('prepares provider amounts and snapshots adapter-owned env policy without moving money', async () => {
        expect(await service.prepare(preparation())).toEqual({ plans: [payment().refundPlan] });
        process.env.IYZICO_REFUND_ROUNDING_MODE = 'FLOOR';
        expect(await service.prepare(preparation())).toEqual({ plans: [payment().refundPlan] });
        expect(client.refund).not.toHaveBeenCalled();
        expect(rows.size).toBe(0);
    });

    it.each([
        ['ROUND', ['3.33', '6.67']],
        ['FLOOR', ['3.34', '6.67']],
        ['USE_FIRST_TWO', ['3.33', '6.66']],
    ])('owns %s normalization in the adapter', async (mode, amounts) => {
        process.env.IYZICO_REFUND_ROUNDING_MODE = mode;
        const adapter = await createService();
        const request = preparation();
        request.items[1].nominalAmount = '6.6667';
        const prepared = await adapter.prepare(request);
        expect(prepared.plans[0].channelData).toEqual({ roundingMode: mode });
        expect(prepared.plans[0].lines.map(line => line.providerAmount)).toEqual(amounts);
        expect(client.refund).not.toHaveBeenCalled();
    });

    it('defaults to THROW, rejects unknown adapter config and reuses a saved plan after policy changes', async () => {
        process.env.IYZICO_REFUND_ROUNDING_MODE = 'invalid';
        await expect(createService()).rejects.toThrow('IYZICO_REFUND_ROUNDING_MODE');
        delete process.env.IYZICO_REFUND_ROUNDING_MODE;
        const adapter = await createService();
        await expect(adapter.prepare(preparation())).rejects.toThrow('two-decimal');
        expect((await adapter.initialize(payment())).paymentStatus).toBe('COMPLETED');
    });

    it('rejects split or mismatched captures and foreign lines in the adapter preflight', async () => {
        const split = preparation();
        split.captures.push({ ...split.captures[0], originalOperationId: 'second' });
        await expect(service.prepare(split)).rejects.toThrow('one full-amount');
        const wrongPurchase = { ...preparation(), purchasePaymentId: 'other' };
        await expect(service.prepare(wrongPurchase)).rejects.toThrow('matching completed');
        const wrongLine = preparation();
        wrongLine.items[0].originalPaymentItemId = 'foreign';
        await expect(service.prepare(wrongLine)).rejects.toThrow('original line');
        expect(client.refund).not.toHaveBeenCalled();
    });

    it('accepts a legacy persisted policy without using the current env mode', async () => {
        const legacy = payment();
        const plan = legacy.refundPlan!;
        delete plan.channelData;
        Object.assign(plan, { roundingMode: 'ROUND' });
        expect((await service.initialize(legacy)).paymentStatus).toBe('COMPLETED');
    });

    it('refunds the original transaction IDs and returns exact provider settlements without a redirect', async () => {
        const result = await service.initialize(payment());
        expect(result).toMatchObject({
            paymentStatus: 'COMPLETED', paymentChannelOperationId: 'refund-id', redirectUrl: '',
            refundSettlements: [
                { originalPaymentItemId: 'a', providerAmount: '3.33' },
                { originalPaymentItemId: 'b', providerAmount: '3.33' },
            ],
        });
        expect(client.refund).toHaveBeenNthCalledWith(1, {
            conversationId: 'refund-id:0', paymentTransactionId: 'txn-a', price: '3.33', currency: 'TRY',
        }, 'provider-payment');
        expect(client.refund).toHaveBeenNthCalledWith(2, expect.objectContaining({ paymentTransactionId: 'txn-b' }), 'provider-payment');
        expect((await service.check('refund-id')).paymentStatus).toBe('COMPLETED');
    });

    it('replays concurrent/duplicate calls without issuing another refund', async () => {
        await Promise.all([service.initialize(payment()), service.initialize(payment())]);
        await service.initialize(payment());
        expect(client.refund).toHaveBeenCalledTimes(2);
        const changed = payment();
        changed.refundPlan!.lines[0].providerAmount = '3.34';
        await expect(service.initialize(changed)).rejects.toThrow('different details');
    });

    it('keeps a successful line when the next call times out and never retries either', async () => {
        client.refund.mockResolvedValueOnce({ refundHostReference: 'ref-a' }).mockRejectedValueOnce(new Error('timeout'));
        const result = await service.initialize(payment());
        expect(result).toMatchObject({
            paymentStatus: 'WAITING', paymentErrorStatus: 'UNKNOWN',
            refundSettlements: [{ originalPaymentItemId: 'a', providerAmount: '3.33' }],
        });
        expect(rows.get('refund-id')?.lines.map(line => line.state)).toEqual(['SUCCEEDED', 'RECONCILIATION_REQUIRED']);
        await service.initialize(payment());
        expect(client.refund).toHaveBeenCalledTimes(2);
    });

    it('marks a definite initial rejection failed without releasing the reservation or resending', async () => {
        client.refund.mockRejectedValueOnce(new IyzicoRefundRejectedError('10000'));
        expect((await service.initialize(payment())).paymentStatus).toBe('FAILED');
        expect(rows.get('refund-id')?.lines[0].errorCode).toBe('10000');
        await service.initialize(payment());
        expect(client.refund).toHaveBeenCalledTimes(1);
    });

    it('keeps an ambiguous first call pending and does not send untouched subsequent lines', async () => {
        client.refund.mockRejectedValueOnce(new Error('invalid signature'));
        expect((await service.initialize(payment())).paymentStatus).toBe('WAITING');
        expect(rows.get('refund-id')?.lines.map(line => line.state)).toEqual(['RECONCILIATION_REQUIRED', 'RESERVED']);
        await service.initialize(payment());
        expect(client.refund).toHaveBeenCalledTimes(1);
    });

    it('does not reissue a call after success could not be persisted', async () => {
        const update = repo.update.getMockImplementation()!;
        let failed = false;
        repo.update.mockImplementation(async (criteria, changes) => {
            if (!failed && changes.lines?.[0]?.state === 'SUCCEEDED') {
                failed = true;
                throw new Error('database connection lost');
            }
            return update(criteria, changes);
        });
        expect((await service.initialize(payment())).paymentStatus).toBe('WAITING');
        await service.initialize(payment());
        expect(client.refund).toHaveBeenCalledTimes(1);
    });

    it('reserves provider capacity across repeated partial refunds including upward rounding', async () => {
        await service.initialize(payment());
        source.itemTransactions![0].paidPrice = '6.66';
        const next = payment();
        next.id = 'refund-payment-2';
        next.refundOperationId = 'refund-id-2';
        next.refundPlan!.channelData = { roundingMode: 'FLOOR' };
        next.refundPlan!.lines[0].providerAmount = '3.34';
        await expect(service.initialize(next)).rejects.toThrow('remaining original');
        expect(client.refund).toHaveBeenCalledTimes(2);
    });

    it('does not resubmit a reservation left SUBMITTING after a process crash', async () => {
        await service.initialize(payment());
        const saved = rows.get('refund-id')!;
        saved.state = 'SUBMITTING';
        saved.lines.forEach(line => { line.state = 'SUBMITTING'; });
        expect((await service.initialize(payment())).paymentStatus).toBe('WAITING');
        expect(client.refund).toHaveBeenCalledTimes(2);
    });

    it('can safely claim a reservation interrupted before any provider submission', async () => {
        const update = repo.update.getMockImplementation()!;
        repo.update.mockRejectedValueOnce(new Error('process interrupted before claim'));
        await expect(service.initialize(payment())).rejects.toThrow('before claim');
        expect(rows.get('refund-id')?.state).toBe('RESERVED');
        expect(client.refund).not.toHaveBeenCalled();
        repo.update.mockImplementation(update);
        expect((await service.initialize(payment())).paymentStatus).toBe('COMPLETED');
        expect(client.refund).toHaveBeenCalledTimes(2);
    });

    it('rejects missing mappings, mismatched totals/currencies and invalid captures before provider calls', async () => {
        const bad = payment();
        bad.refundPlan!.lines[0].originalPaymentItemId = 'new-refund-payment-item-id';
        await expect(service.initialize(bad)).rejects.toThrow('missing from');
        const duplicate = payment();
        duplicate.refundPlan!.lines[1].originalPaymentItemId = 'a';
        await expect(service.initialize(duplicate)).rejects.toThrow('identities');
        const amount = payment();
        amount.captureInfo.paidAmount = 1;
        await expect(service.initialize(amount)).rejects.toThrow('capture');
        source.currency = 'USD';
        await expect(service.initialize(payment())).rejects.toThrow('completed iyzico');
        source.currency = 'TRY';
        source.status = 'FAILED';
        await expect(service.initialize(payment())).rejects.toThrow('completed iyzico');
        expect(client.refund).not.toHaveBeenCalled();
        expect(rows.size).toBe(0);
    });
});
