import { Test } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Logger } from '@nestjs/common';
import {
    ExternalPlatform, PaymentChannelOperation, Report, ReportExpense, ReportItem,
    ReportPaymentRelation, ReportPlatform, ReportQuery, ReportTaxGroup,
} from '@tk-postral/postral-entities';
import { EXTERNAL_ITEM_CLASS_COMISSION_PREFIX, EXTERNAL_PLATFORM_COMISSION_PREFIX, ITEM_CLASS_COMISSION_PREFIX, PAYMENT_CHANNEL_FEE_PREFIX, PAYMENT_SERVICE_FEE, PLATFORM_COMISSION_TOTAL, REPORT_TOTAL, PaymentFullDTO, PaymentItemDTO, POSTRAL_INSTANCE, ReportType } from '@tk-postral/payment-common';
import { ReportDigestionService } from './report-digestion.service';
import { PaymentCommonService } from './payment-common.service';
import { AppComissionService } from './app-commission.service';
import { SellerPaymentOrderSearchService } from './transaction-search.service';
import { AdminSettingsService } from './admin-settings.service';
import { EventSenderService } from './event-management.service';
import { SellerReportSetupService } from './seller-report-setup.service';
import { REFUND_ROUNDING_ADJUSTMENT } from '@tk-postral/payment-common';

describe('ReportDigestionService sales breakdown', () => {
    let service: ReportDigestionService;
    let storedItems: ReportItem[];
    let storedPlatforms: ReportPlatform[];
    const itemRepo = { findOne: jest.fn(), save: jest.fn() };
    const platformRepo = { findOne: jest.fn(), save: jest.fn() };
    const externalRepo = { findOneBy: jest.fn() };
    const reportRepo = { findOne: jest.fn(), save: jest.fn() };
    const relations = { createQueryBuilder: jest.fn(), update: jest.fn(), find: jest.fn(), save: jest.fn() };
    const expenses = { find: jest.fn(), findOne: jest.fn(), save: jest.fn() };
    const taxGroups = { findOne: jest.fn(), save: jest.fn() };
    const operations = { find: jest.fn() };
    const payments = { findPaymentById: jest.fn() };
    const admin = { getAdminSettings: jest.fn() };
    const external = { platformKey: 'EXTERNAL', platformName: 'External marketplace', externalPlatformId: 'external' };
    const direct = { platformKey: POSTRAL_INSTANCE, platformName: 'Postral' };
    const item = (values: Partial<PaymentItemDTO> = {}): PaymentItemDTO => new PaymentItemDTO({
        id: 'payment-item', itemId: '', name: 'Product', variation: '',
        sellerAccountId: 'seller', quantity: 2, totalAmount: 240, taxAmount: 40,
        originalUnitAmount: 120, appComissionAmount: 20, taxPercent: 20, ...values,
    });
    const payment = (values: Partial<PaymentFullDTO> = {}): PaymentFullDTO => Object.assign(new PaymentFullDTO(), {
        id: 'purchase', type: 'PURCHASE', currency: 'TRY', includeInReportDigestion: true,
        totalAmount: 240, items: [item()], ...values,
    });

    beforeEach(async () => {
        jest.resetAllMocks();
        storedItems = [];
        storedPlatforms = [];
        itemRepo.findOne.mockImplementation(({ where }: { where: Pick<ReportItem, 'reportId' | 'accountId' | 'reportItemKey'> }) =>
            storedItems.find(row => row.reportId === where.reportId && row.accountId === where.accountId && row.reportItemKey === where.reportItemKey) ?? null);
        itemRepo.save.mockImplementation(async (row: ReportItem) => {
            if (!storedItems.includes(row)) {
                row.id = `item-${storedItems.length}`;
                storedItems.push(row);
            }
            return row;
        });
        platformRepo.findOne.mockImplementation(({ where }: { where: Pick<ReportPlatform, 'reportId' | 'accountId' | 'platformKey'> }) =>
            storedPlatforms.find(row => row.reportId === where.reportId && row.accountId === where.accountId && row.platformKey === where.platformKey) ?? null);
        platformRepo.save.mockImplementation(async (row: ReportPlatform) => {
            if (!storedPlatforms.includes(row)) {
                row.id = `platform-${storedPlatforms.length}`;
                storedPlatforms.push(row);
            }
            return row;
        });
        externalRepo.findOneBy.mockResolvedValue(Object.assign(new ExternalPlatform(), {
            id: 'external', code: 'EXTERNAL', name: 'External marketplace',
        }));
        reportRepo.save.mockImplementation(async row => row);
        expenses.find.mockResolvedValue([]);
        expenses.findOne.mockResolvedValue(null);
        expenses.save.mockImplementation(async row => row);
        taxGroups.findOne.mockResolvedValue(null);
        taxGroups.save.mockImplementation(async row => row);
        operations.find.mockResolvedValue([]);
        admin.getAdminSettings.mockResolvedValue({ comissionItemTax: { variations: [{ taxRate: 20 }] } });
        const builder = {
            select: jest.fn().mockReturnThis(), distinctOn: jest.fn().mockReturnThis(),
            where: jest.fn().mockReturnThis(), getMany: jest.fn().mockResolvedValue([]),
        };
        relations.createQueryBuilder.mockReturnValue(builder);
        relations.save.mockImplementation(async row => row);
        const module = await Test.createTestingModule({
            providers: [
                ReportDigestionService,
                { provide: getRepositoryToken(Report), useValue: reportRepo },
                { provide: getRepositoryToken(ReportQuery), useValue: {} },
                { provide: getRepositoryToken(ReportTaxGroup), useValue: taxGroups },
                { provide: getRepositoryToken(ReportPaymentRelation), useValue: relations },
                { provide: getRepositoryToken(ReportExpense), useValue: expenses },
                { provide: getRepositoryToken(PaymentChannelOperation), useValue: operations },
                { provide: getRepositoryToken(ReportItem), useValue: itemRepo },
                { provide: getRepositoryToken(ReportPlatform), useValue: platformRepo },
                { provide: getRepositoryToken(ExternalPlatform), useValue: externalRepo },
                { provide: AppComissionService, useValue: {} },
                { provide: PaymentCommonService, useValue: payments },
                { provide: SellerPaymentOrderSearchService, useValue: { findByPaymentIdAndAccountId: async () => ({ amount: 240 }) } },
                { provide: AdminSettingsService, useValue: admin },
                { provide: EventSenderService, useValue: {} },
                { provide: SellerReportSetupService, useValue: {} },
            ],
        }).compile();
        service = module.get(ReportDigestionService);
    });

    describe('commission expense attribution', () => {
        let storedExpenses: ReportExpense[];

        beforeEach(() => {
            storedExpenses = [];
            expenses.find.mockImplementation(async ({ where }: { where: { reportId: string; accountId: string } }) =>
                storedExpenses.filter(row => row.reportId === where.reportId && row.accountId === where.accountId));
            expenses.save.mockImplementation(async (rows: ReportExpense[]) => {
                for (const row of rows) {
                    if (!storedExpenses.includes(row)) storedExpenses.push(row);
                }
                return rows;
            });
        });

        it('keeps Postral and each external platform separate while charging each commission once to total expenses', async () => {
            const data = payment({ items: [item({ itemClass: 'BOOK' }), item({ sellerAccountId: 'other', appComissionAmount: 999 })] });
            await service['updateExpensesForReport']('report', data, 'seller');
            await service['updateExpensesForReport']('report', { ...data, externalPlatformId: 'external' }, 'seller');
            externalRepo.findOneBy.mockResolvedValue({ id: 'other-platform', code: 'OTHER' });
            await service['updateExpensesForReport']('report', {
                ...data, externalPlatformId: 'other-platform', items: [item({ itemClass: 'BOOK', appComissionAmount: 30 })],
            }, 'seller');
            const amounts = Object.fromEntries(storedExpenses.map(row => [row.expenseKey, row.expenseAmount]));
            expect(amounts).toEqual({
                [PLATFORM_COMISSION_TOTAL]: 20,
                [ITEM_CLASS_COMISSION_PREFIX + 'BOOK']: 20,
                [EXTERNAL_PLATFORM_COMISSION_PREFIX + 'EXTERNAL']: 20,
                [EXTERNAL_ITEM_CLASS_COMISSION_PREFIX + 'EXTERNAL:BOOK']: 20,
                [EXTERNAL_PLATFORM_COMISSION_PREFIX + 'OTHER']: 30,
                [EXTERNAL_ITEM_CLASS_COMISSION_PREFIX + 'OTHER:BOOK']: 30,
                [REPORT_TOTAL]: 70,
            });
            expect(storedExpenses.filter(row => row.expenseKey.startsWith(EXTERNAL_PLATFORM_COMISSION_PREFIX))
                .every(row => row.displayWeight === 2)).toBe(true);
            expect(storedExpenses.filter(row => row.expenseKey.startsWith(EXTERNAL_ITEM_CLASS_COMISSION_PREFIX))
                .every(row => row.displayWeight === 3)).toBe(true);
        });

        it('subtracts refunded external commissions only from the matching source and report total', async () => {
            await service['updateExpensesForReport']('report', payment(), 'seller');
            const externalPayment = payment({ externalPlatformId: 'external', items: [item({ itemClass: 'BOOK', appComissionAmount: 50 })] });
            await service['updateExpensesForReport']('report', externalPayment, 'seller');
            await service['updateExpensesForReport']('report', {
                ...externalPayment, type: 'REFUND', items: [item({ itemClass: 'BOOK', appComissionAmount: 15 })],
            }, 'seller');
            expect(storedExpenses.find(row => row.expenseKey === PLATFORM_COMISSION_TOTAL)?.expenseAmount).toBe(20);
            expect(storedExpenses.find(row => row.expenseKey === EXTERNAL_PLATFORM_COMISSION_PREFIX + 'EXTERNAL')?.expenseAmount).toBe(35);
            expect(storedExpenses.find(row => row.expenseKey === EXTERNAL_ITEM_CLASS_COMISSION_PREFIX + 'EXTERNAL:BOOK')?.expenseAmount).toBe(35);
            expect(storedExpenses.find(row => row.expenseKey === REPORT_TOTAL)?.expenseAmount).toBe(55);
        });

        it('preserves all-seller flow filtering and encodes delimiter characters without creating Postral rows', async () => {
            externalRepo.findOneBy.mockResolvedValue({ id: 'external', code: 'MARKET:TR' });
            await service['updateExpensesForReport']('flow', payment({
                externalPlatformId: 'external',
                items: [item({ itemClass: 'BOOK:PRINT' }), item({ sellerAccountId: 'other' })],
            }), 'owner', null);
            expect(storedExpenses.find(row => row.expenseKey === EXTERNAL_PLATFORM_COMISSION_PREFIX + 'MARKET%3ATR'))
                .toMatchObject({ accountId: 'owner', expenseAmount: 40 });
            expect(storedExpenses.find(row => row.expenseKey === EXTERNAL_ITEM_CLASS_COMISSION_PREFIX + 'MARKET%3ATR:BOOK%3APRINT')?.expenseAmount).toBe(20);
            expect(storedExpenses.find(row => row.expenseKey === REPORT_TOTAL)?.expenseAmount).toBe(40);
            expect(storedExpenses.some(row => row.expenseKey === PLATFORM_COMISSION_TOTAL || row.expenseKey.startsWith(ITEM_CLASS_COMISSION_PREFIX))).toBe(false);
        });

        it('does not attribute an unresolved external commission to Postral', async () => {
            externalRepo.findOneBy.mockResolvedValue(null);
            await expect(service['updateExpensesForReport']('report', payment({ externalPlatformId: 'missing' }), 'seller'))
                .rejects.toThrow('missing or invalid external platform');
            expect(expenses.save).not.toHaveBeenCalled();
        });
    });

    describe('payment service fee attribution by channel', () => {
        let storedExpenses: ReportExpense[];

        beforeEach(() => {
            storedExpenses = [];
            expenses.find.mockImplementation(async ({ where }: { where: { reportId: string; accountId: string } }) =>
                storedExpenses.filter(row => row.reportId === where.reportId && row.accountId === where.accountId));
            expenses.save.mockImplementation(async (rows: ReportExpense[]) => {
                for (const row of rows) {
                    if (!storedExpenses.includes(row)) storedExpenses.push(row);
                }
                return rows;
            });
        });

        const op = (paymentChannelId: string, providerFee: number) =>
            Object.assign(new PaymentChannelOperation(), { paymentChannelId, providerFee });

        it('splits platform provider fees per channel while charging the total and report total once', async () => {
            operations.find.mockResolvedValueOnce([op('iyzico', 5), op('dummy-ecommerce', 2)]);
            await service['updateProviderFeeExpenseForPlatformReport']('report', payment());
            operations.find.mockResolvedValueOnce([op('iyzico', 3), op('market:tr', 1)]);
            await service['updateProviderFeeExpenseForPlatformReport']('report', payment({ id: 'second' }));

            const amounts = Object.fromEntries(storedExpenses.map(row => [row.expenseKey, row.expenseAmount]));
            expect(amounts).toEqual({
                [PAYMENT_SERVICE_FEE]: 11,
                [PAYMENT_CHANNEL_FEE_PREFIX + 'iyzico']: 8,
                [PAYMENT_CHANNEL_FEE_PREFIX + 'dummy-ecommerce']: 2,
                [PAYMENT_CHANNEL_FEE_PREFIX + 'market%3Atr']: 1,
                [REPORT_TOTAL]: 11,
            });
            expect(storedExpenses.every(row => row.accountId === 'PLATFORM')).toBe(true);
            expect(storedExpenses.find(row => row.expenseKey === PAYMENT_SERVICE_FEE)?.displayWeight).toBe(2);
            expect(storedExpenses.filter(row => row.expenseKey.startsWith(PAYMENT_CHANNEL_FEE_PREFIX))
                .every(row => row.displayWeight === 3)).toBe(true);
        });

        it('applies the seller share ratio to each channel fee and adds to existing commission totals', async () => {
            await service['updateExpensesForReport']('report', payment(), 'seller');
            operations.find.mockResolvedValueOnce([op('iyzico', 10), op('dummy-ecommerce', 4)]);
            await service['updateProviderFeeExpenseForReportAccountId']('report', payment({ totalAmount: 480 }), 'seller');

            const amounts = Object.fromEntries(storedExpenses.map(row => [row.expenseKey, row.expenseAmount]));
            expect(amounts[PAYMENT_CHANNEL_FEE_PREFIX + 'iyzico']).toBe(5);
            expect(amounts[PAYMENT_CHANNEL_FEE_PREFIX + 'dummy-ecommerce']).toBe(2);
            expect(amounts[PAYMENT_SERVICE_FEE]).toBe(7);
            expect(amounts[REPORT_TOTAL]).toBe(27); // 20 komisyon + 7 ödeme hizmeti
        });

        it('writes nothing when there is no positive provider fee', async () => {
            operations.find.mockResolvedValueOnce([]);
            await service['updateProviderFeeExpenseForPlatformReport']('report', payment());
            expect(expenses.save).not.toHaveBeenCalled();
        });

        it('adds signed refund rounding once to platform expenses, not provider fees or seller amounts', async () => {
            const report = Object.assign(new Report(), {
                id: 'report', reportType: 'PLATFORM', query: { ownerAccountId: 'platform-account' },
            });
            operations.find.mockResolvedValue([Object.assign(new PaymentChannelOperation(), {
                paymentChannelId: 'arbitrary-refund-channel',
                settledRefundItemIds: ['original-a'],
                refundPlan: { lines: [
                    { originalPaymentItemId: 'original-a', nominalAmount: '3.3333', providerAmount: '3.33' },
                    { originalPaymentItemId: 'unsettled', nominalAmount: '3.3333', providerAmount: '3.34' },
                ] },
            })]);
            await service['updateRefundRoundingExpense'](report, payment({ type: 'REFUND' }));
            expect(operations.find).toHaveBeenCalledWith({
                where: { paymentId: 'purchase', operationType: 'REFUND' },
            });
            expect(storedExpenses.map(row => [row.accountId, row.expenseKey, row.expenseAmount])).toEqual([
                ['platform-account', REFUND_ROUNDING_ADJUSTMENT, -0.0033],
                ['platform-account', REPORT_TOTAL, -0.0033],
            ]);
            expect(report.totalExpense).toBe(-0.0033);
            expect(storedExpenses.some(row => row.expenseKey === PAYMENT_SERVICE_FEE)).toBe(false);
            expect(storedExpenses.find(row => row.expenseKey === REPORT_TOTAL)?.displayWeight).toBe(1);
        });
    });

    it('groups ID-less products by normalized name across payments, with refund accounting', async () => {
        await service['updatePaymentItemReport']('report', payment({
            items: [item({ name: '  Test   Product ' }), item({ name: 'Other product' }), item({ name: 'TEST PRODUCT' })],
        }), 'seller');
        await service['updatePaymentItemReport']('report', payment({ items: [item({ name: 'test product' })] }), 'seller');
        await service['updatePaymentItemReport']('report', payment({
            type: 'REFUND', items: [item({ name: 'Test Product', quantity: 1, totalAmount: 120, taxAmount: 20, appComissionAmount: 10 })],
        }), 'seller');
        expect(storedItems).toHaveLength(2);
        expect(storedItems[0]).toMatchObject({
            identifiedByName: true, itemId: '', purchasedQuantity: 6, refundedQuantity: 1,
            itemQuantity: 5, purchasedTotalAmount: 720, refundedTotalAmount: 120,
            itemTotalAmount: 600, itemTaxAmount: 100, itemComissionAmount: 50,
        });
        expect(storedItems[1]).toMatchObject({ itemName: 'Other product', purchasedQuantity: 2 });
    });

    it('preserves catalog identity and variation, filters sellers, and isolates report accounts', async () => {
        const data = payment({ items: [
            item({ itemId: 'catalog', name: 'Old name', variation: 'red' }),
            item({ itemId: 'catalog', name: 'New name', variation: 'red' }),
            item({ itemId: 'catalog', variation: 'blue' }),
            item({ sellerAccountId: 'other' }),
        ] });
        await service['updatePaymentItemReport']('report', data, 'seller');
        expect(storedItems).toHaveLength(2);
        expect(storedItems[0]).toMatchObject({ identifiedByName: false, purchasedQuantity: 4, reportItemKey: 'report_catalog_red' });
        await service['updatePaymentItemReport']('report', payment(), 'other');
        expect(storedItems).toHaveLength(2);
        await service['updatePaymentItemReport']('report', data);
        expect(storedItems).toHaveLength(5);
        expect(storedItems.slice(2).every(row => row.accountId === 'PLATFORM')).toBe(true);
    });

    it('counts orders once while summing only seller items, separately from quantity', async () => {
        await service['updatePlatformReport']('report', payment({ items: [
            item(), item({ quantity: 0.5, totalAmount: 60, taxAmount: 10 }),
            item({ sellerAccountId: 'other', totalAmount: 999 }),
        ] }), external, 'seller');
        expect(storedPlatforms[0]).toMatchObject({
            accountId: 'seller', platformKey: 'EXTERNAL', externalPlatformId: 'external',
            purchaseCount: 1, refundCount: 0, soldQuantity: 2.5,
            totalSaleAmount: 300, totalSaleTaxAmount: 50, netSaleAmount: 300, netRevenue: 250,
        });
        await service['updatePlatformReport']('report', payment({ items: [item({ sellerAccountId: 'other' })] }), external, 'seller');
        expect(storedPlatforms[0].purchaseCount).toBe(1);
    });

    it('keeps direct and external sources separate and accounts for refunds without reducing purchase count', async () => {
        await service['updatePlatformReport']('report', payment(), direct, 'seller');
        await service['updatePlatformReport']('report', payment(), external, 'seller');
        await service['updatePlatformReport']('report', payment({
            type: 'REFUND', items: [item({ quantity: 1, totalAmount: 120, taxAmount: 20 })],
        }), direct, 'seller');
        expect(storedPlatforms).toHaveLength(2);
        expect(storedPlatforms[0]).toMatchObject({
            platformKey: POSTRAL_INSTANCE, purchaseCount: 1, refundCount: 1,
            soldQuantity: 2, refundedQuantity: 1, totalSaleAmount: 240,
            totalRefundAmount: 120, totalSaleTaxAmount: 40, totalRefundTaxAmount: 20,
            netSaleAmount: 120, netRevenue: 100,
        });
        expect(storedPlatforms[1]).toMatchObject({ purchaseCount: 1, refundCount: 0, netSaleAmount: 240 });
    });

    it('aggregates all sellers in platform flow and isolates report IDs', async () => {
        await service['updatePlatformReport']('report', payment({ items: [item(), item({ sellerAccountId: 'other' })] }), direct);
        await service['updatePlatformReport']('other-report', payment(), direct);
        expect(storedPlatforms).toHaveLength(2);
        expect(storedPlatforms[0]).toMatchObject({ accountId: 'PLATFORM', purchaseCount: 1, soldQuantity: 4, totalSaleAmount: 480 });
        expect(storedPlatforms[1]).toMatchObject({ reportId: 'other-report', totalSaleAmount: 240 });
    });

    it('uses decimal-safe addition for platform totals', async () => {
        await service['updatePlatformReport']('report', payment({
            items: [item({ quantity: 0.1, totalAmount: 0.1, taxAmount: 0 }), item({ quantity: 0.2, totalAmount: 0.2, taxAmount: 0 })],
        }), direct);
        expect(storedPlatforms[0]).toMatchObject({ soldQuantity: 0.3, totalSaleAmount: 0.3, netRevenue: 0.3 });
    });

    it('does not merge unrelated external sources that reuse a platform code', async () => {
        await service['updatePlatformReport']('report', payment(), external, 'seller');
        await expect(service['updatePlatformReport']('report', payment(), {
            ...external, externalPlatformId: 'other-external',
        }, 'seller')).rejects.toThrow('conflicts with an existing source');
        expect(platformRepo.save).toHaveBeenCalledTimes(1);
        expect(storedPlatforms[0].purchaseCount).toBe(1);
    });

    it('caches platform codes and never defaults a missing or reserved external source to Postral', async () => {
        const cache = new Map<string, ExternalPlatform>();
        const data = payment({ externalPlatformId: 'external' });
        expect(await service['resolveReportPlatform'](data, cache)).toEqual(external);
        expect(await service['resolveReportPlatform'](data, cache)).toEqual(external);
        expect(externalRepo.findOneBy).toHaveBeenCalledTimes(1);
        expect(await service['resolveReportPlatform'](payment(), cache)).toEqual(direct);
        externalRepo.findOneBy.mockResolvedValue(null);
        await expect(service['resolveReportPlatform'](payment({ externalPlatformId: 'missing' }), cache)).rejects.toThrow('missing or invalid external platform');
        externalRepo.findOneBy.mockResolvedValue({ id: 'reserved', code: POSTRAL_INSTANCE });
        await expect(service['resolveReportPlatform'](payment({ externalPlatformId: 'reserved' }), cache)).rejects.toThrow('missing or invalid external platform');
    });

    const queueReports = (types: ReportType[]): Report[] => {
        const reports = types.map((reportType, index) => Object.assign(new Report(), {
            id: `report-${index}`, reportType, query: Object.assign(new ReportQuery(), { ownerAccountId: 'seller' }),
        }));
        relations.find.mockResolvedValue(reports.map(report => Object.assign(new ReportPaymentRelation(), {
            reportId: report.id, paymentId: 'purchase', accountId: 'seller', digestionStatus: 'DIGESTING',
        })));
        reportRepo.findOne.mockImplementation(({ where }: { where: { id: string } }) =>
            reports.find(report => report.id === where.id) ?? null);
        return reports;
    };

    it('wires seller and flow digestion but skips all external activity in commission reports', async () => {
        const reports = queueReports(['SELLER', 'PLATFORM_FLOW', 'PLATFORM', 'PLATFORM_SELLER']);
        payments.findPaymentById.mockResolvedValue(payment({ externalPlatformId: 'external' }));
        await service.checkRelations();
        expect(storedPlatforms).toHaveLength(2);
        expect(storedPlatforms.map(row => row.reportId)).toEqual(['report-0', 'report-1']);
        expect(storedItems).toHaveLength(2);
        expect(externalRepo.findOneBy).toHaveBeenCalledTimes(1);
        for (const [rows] of expenses.save.mock.calls) {
            expect(rows).toEqual(expect.arrayContaining([
                expect.objectContaining({ expenseKey: EXTERNAL_PLATFORM_COMISSION_PREFIX + 'EXTERNAL', expenseAmount: 20 }),
                expect.objectContaining({ expenseKey: REPORT_TOTAL, expenseAmount: 20 }),
            ]));
            expect(rows.some((row: ReportExpense) => row.expenseKey === PLATFORM_COMISSION_TOTAL)).toBe(false);
        }
        expect(admin.getAdminSettings).not.toHaveBeenCalled();
        expect(operations.find).toHaveBeenCalledTimes(2);
        expect(reports[2].totalSaleAmount).toBe(0);
        expect(reports[3].totalSaleAmount).toBe(0);
        expect(relations.save).toHaveBeenCalledTimes(4);
        expect(relations.save.mock.calls.every(([row]) => row.digestionStatus === 'COMPLETED')).toBe(true);
    });

    it('preserves native commission reports without adding sales-platform rows to them', async () => {
        const reports = queueReports(['PLATFORM', 'PLATFORM_SELLER']);
        payments.findPaymentById.mockResolvedValue(payment());
        await service.checkRelations();
        expect(storedPlatforms).toEqual([]);
        expect(externalRepo.findOneBy).not.toHaveBeenCalled();
        expect(reports.map(report => report.totalSaleAmount)).toEqual([20, 20]);
        expect(reports.map(report => report.paymentCount)).toEqual([1, 1]);
    });

    it('does not process excluded payments or falsely complete digestion on platform resolution failure', async () => {
        queueReports(['SELLER']);
        payments.findPaymentById.mockResolvedValue(payment({ includeInReportDigestion: false }));
        await service.checkRelations();
        expect(storedPlatforms).toEqual([]);
        expect(itemRepo.save).not.toHaveBeenCalled();
        relations.save.mockClear();
        payments.findPaymentById.mockResolvedValue(payment({ externalPlatformId: 'missing' }));
        externalRepo.findOneBy.mockResolvedValue(null);
        const log = jest.spyOn(Logger.prototype, 'error').mockImplementation(() => undefined);
        try {
            await service.checkRelations();
            expect(log).toHaveBeenCalledWith(expect.stringContaining('missing or invalid external platform'));
            expect(relations.save).not.toHaveBeenCalled();
            expect(reportRepo.save).not.toHaveBeenCalled();
            expect(service.checkingRelations).toBe(false);
        } finally {
            log.mockRestore();
        }
    });
});
