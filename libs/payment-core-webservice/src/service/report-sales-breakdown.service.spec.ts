import { Test } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Logger } from '@nestjs/common';
import {
    ExternalPlatform, PaymentChannelOperation, Report, ReportExpense, ReportItem,
    ReportPaymentRelation, ReportPlatform, ReportQuery, ReportTaxGroup,
} from '@tk-postral/postral-entities';
import { PaymentFullDTO, PaymentItemDTO, POSTRAL_INSTANCE, ReportType } from '@tk-postral/payment-common';
import { ReportDigestionService } from './report-digestion.service';
import { PaymentCommonService } from './payment-common.service';
import { AppComissionService } from './app-commission.service';
import { SellerPaymentOrderSearchService } from './transaction-search.service';
import { AdminSettingsService } from './admin-settings.service';
import { EventSenderService } from './event-management.service';
import { SellerReportSetupService } from './seller-report-setup.service';

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
