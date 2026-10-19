import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { ReportDigestionService } from './report-digestion.service';
import {
    Report,
    ReportQuery,
    ReportTaxGroup,
    ReportPaymentRelation,
    ReportExpense,
    PaymentChannelOperation,
} from '@tk-postral/postral-entities';
import { PaymentCommonService } from './payment-common.service';
import { AppComissionService } from './app-commission.service';
import { SellerPaymentOrderSearchService } from './transaction-search.service';
import { AdminSettingsService } from './admin-settings.service';
import { AmountCalculationUtil } from '@tk-postral/common-utils';
import { PLATFORM_COMISSION_TOTAL, REPORT_TOTAL, ITEM_CLASS_COMISSION_PREFIX, PAYMENT_SERVICE_FEE } from '@tk-postral/payment-common';

// ─────────────────────────────────────────────────────────────
// Yardımcı fabrikalar
// ─────────────────────────────────────────────────────────────

function makeReport(overrides: Partial<Report> = {}): Report {
    const r = new Report();
    r.id = 'report-1';
    r.queryId = 'query-1';
    r.periodLabel = '2025-01-01';
    r.currency = 'TRY';
    r.accountId = 'seller-1';
    r.reportType = 'SELLER';
    r.paymentCount = 0;
    r.totalSaleAmount = 0;
    r.totalRefundAmount = 0;
    r.totalSaleTaxAmount = 0;
    r.totalRefundTaxAmount = 0;
    r.netTaxAmount = 0;
    r.netSaleAmount = 0;
    r.netRevenue = 0;
    r.totalExpense = 0;
    r.netRevenueWithoutExpense = 0;
    r.netRevenueWithoutExpenseTaxed = 0;
    Object.assign(r, overrides);
    return r;
}

function makeQuery(overrides: Partial<ReportQuery> = {}): ReportQuery {
    const q = new ReportQuery();
    q.id = 'query-1';
    q.ownerAccountId = 'seller-1';
    q.currency = 'TRY';
    q.dateGrouping = 'DAILY';
    q.reportType = 'SELLER';
    Object.assign(q, overrides);
    return q;
}

function makePayment(overrides: any = {}): any {
    return {
        id: 'payment-1',
        type: 'PURCHASE',
        totalAmount: 1000,
        currency: 'TRY',
        createdAt: '2025-01-15T10:00:00.000Z',
        includeInReportDigestion: true,
        items: [
            {
                id: 'item-1',
                sellerAccountId: 'seller-1',
                sellerAccountName: 'Satıcı Bir',
                totalAmount: 1000,
                taxAmount: 180,
                taxPercent: 18,
                appComissionPercent: 10,
                appComissionAmount: 100,
                itemClass: 'ELECTRONICS',
            },
        ],
        ...overrides,
    };
}

function makeRepoMock() {
    return {
        findOne: jest.fn(),
        find: jest.fn(),
        save: jest.fn(entity => Promise.resolve(entity)),
        count: jest.fn(),
        update: jest.fn(),
        createQueryBuilder: jest.fn(),
    };
}

// ─────────────────────────────────────────────────────────────
// Test Suite
// ─────────────────────────────────────────────────────────────

describe('ReportDigestionService', () => {
    let service: ReportDigestionService;

    const reportRepo = makeRepoMock();
    const queryRepo = makeRepoMock();
    const taxGroupRepo = makeRepoMock();
    const relationRepo = makeRepoMock();
    const expenseRepo = makeRepoMock();
    const channelOpRepo = makeRepoMock();

    const paymentCommonService = { findPaymentById: jest.fn() };
    const comissionService = {};
    const sellerPaymentOrderService = { findByPaymentIdAndAccountId: jest.fn() };
    const admSettings = { getAdminSettings: jest.fn() };

    beforeEach(async () => {
        jest.clearAllMocks();

        // Varsayılan admin settings: %18 komisyon vergisi
        admSettings.getAdminSettings.mockResolvedValue({
            comissionItemTax: { variations: [{ taxRate: 18 }] },
        });

        const module: TestingModule = await Test.createTestingModule({
            providers: [
                ReportDigestionService,
                { provide: getRepositoryToken(Report), useValue: reportRepo },
                { provide: getRepositoryToken(ReportQuery), useValue: queryRepo },
                { provide: getRepositoryToken(ReportTaxGroup), useValue: taxGroupRepo },
                { provide: getRepositoryToken(ReportPaymentRelation), useValue: relationRepo },
                { provide: getRepositoryToken(ReportExpense), useValue: expenseRepo },
                { provide: getRepositoryToken(PaymentChannelOperation), useValue: channelOpRepo },
                { provide: PaymentCommonService, useValue: paymentCommonService },
                { provide: AppComissionService, useValue: comissionService },
                { provide: SellerPaymentOrderSearchService, useValue: sellerPaymentOrderService },
                { provide: AdminSettingsService, useValue: admSettings },
            ],
        }).compile();

        service = module.get<ReportDigestionService>(ReportDigestionService);
    });

    // ─────────────────────────────────────────────────────────────
    // buildPeriodLabel
    // ─────────────────────────────────────────────────────────────
    describe('buildPeriodLabel', () => {
        it('DAILY: YYYY-MM-DD formatı döner', () => {
            const result = service.buildPeriodLabel('DAILY', new Date(2025, 2, 5)); // Mart 5
            expect(result).toBe('2025-03-05');
        });

        it('MONTHLY: YYYY-MM formatı döner', () => {
            expect(service.buildPeriodLabel('MONTHLY', new Date(2025, 11, 1))).toBe('2025-12');
        });

        it('YEARLY: YYYY formatı döner', () => {
            expect(service.buildPeriodLabel('YEARLY', new Date(2025, 0, 1))).toBe('2025');
        });

        it('ALL: sabit string döner', () => {
            expect(service.buildPeriodLabel('ALL', new Date())).toBe('ALL');
        });

        it('bilinmeyen grouping: "ALL" döner', () => {
            expect(service.buildPeriodLabel('UNKNOWN' as any, new Date())).toBe('ALL');
        });

        it('WEEKLY: ISO 8601 formatında YYYY-Www döner', () => {
            // 6 Ocak 2025 = ISO hafta 2 (1 Ocak Çarşamba = hafta 1, 6 Ocak Pazartesi = hafta 2)
            const result = service.buildPeriodLabel('WEEKLY', new Date(2025, 0, 6));
            expect(result).toMatch(/^2025-W\d{2}$/);
        });

        it('WEEKLY: 1 Ocak 2024 = hafta 1', () => {
            // 1 Ocak 2024 Pazartesi = ISO hafta 1
            const result = service.buildPeriodLabel('WEEKLY', new Date(2024, 0, 1));
            expect(result).toBe('2024-W01');
        });
    });

    // ─────────────────────────────────────────────────────────────
    // findOrCreateByQuery
    // ─────────────────────────────────────────────────────────────
    describe('findOrCreateByQuery', () => {
        it('mevcut raporu bulursa döndürür (yeni kayıt oluşturmaz)', async () => {
            const existingReport = makeReport();
            reportRepo.findOne.mockResolvedValue(existingReport);

            const query = makeQuery();
            const result = await service.findOrCreateByQuery(query, '2025-01-01', 'TRY');

            expect(result).toBe(existingReport);
            expect(reportRepo.save).not.toHaveBeenCalled();
        });

        it('bulunamazsa yeni rapor oluşturur ve kaydeder', async () => {
            reportRepo.findOne.mockResolvedValue(null);
            const savedReport = makeReport();
            reportRepo.save.mockResolvedValue(savedReport);

            const query = makeQuery();
            const result = await service.findOrCreateByQuery(query, '2025-01-01', 'TRY');

            expect(reportRepo.save).toHaveBeenCalledTimes(1);
            const savedArg = reportRepo.save.mock.calls[0][0];
            expect(savedArg.queryId).toBe(query.id);
            expect(savedArg.currency).toBe('TRY');
            expect(savedArg.reportType).toBe(query.reportType);
        });

        it('ownerAccountId null ise hata fırlatır', async () => {
            reportRepo.findOne.mockResolvedValue(null);
            const query = makeQuery({ ownerAccountId: null as any });

            await expect(service.findOrCreateByQuery(query, '2025-01-01', 'TRY')).rejects.toThrow();
        });

        it('[BUG FIX] save unique constraint hatası atarsa re-fetch yapıp varolan raporu döndürür', async () => {
            // İlk findOne: boş (kayıt yok)
            // save: unique constraint hatası
            // İkinci findOne: başka instance'ın oluşturduğu raporu döndürür
            const raceReport = makeReport({ id: 'race-report' });
            reportRepo.findOne
                .mockResolvedValueOnce(null)       // ilk fetch: bulunamadı
                .mockResolvedValueOnce(raceReport); // re-fetch sonrası bulundu
            reportRepo.save.mockRejectedValue({ code: '23505', message: 'unique_violation' });

            const query = makeQuery();
            const result = await service.findOrCreateByQuery(query, '2025-01-01', 'TRY');

            expect(result).toBe(raceReport);
            expect(reportRepo.findOne).toHaveBeenCalledTimes(2);
        });

        it('[BUG FIX] save hatası atar ve re-fetch de boş dönerse hatayı yeniden fırlatır', async () => {
            reportRepo.findOne.mockResolvedValue(null);
            const err = new Error('başka bir DB hatası');
            reportRepo.save.mockRejectedValue(err);

            const query = makeQuery();
            await expect(service.findOrCreateByQuery(query, '2025-01-01', 'TRY')).rejects.toThrow('başka bir DB hatası');
        });
    });

    // ─────────────────────────────────────────────────────────────
    // digestComissionIncomeForReport
    // ─────────────────────────────────────────────────────────────
    describe('digestComissionIncomeForReport', () => {

        function makePlatformReport(overrides: Partial<Report> = {}): Report {
            const q = makeQuery({ ownerAccountId: 'PLATFORM', reportType: 'PLATFORM' });
            const r = makeReport({
                id: 'platform-report-1',
                accountId: 'PLATFORM',
                reportType: 'PLATFORM',
                query: q,
                ...overrides,
            });
            return r;
        }

        function setupExpenseRepoEmpty() {
            // fetchOrCreate: her zaman yeni expense oluşturur
            expenseRepo.findOne.mockResolvedValue(null);
            expenseRepo.save.mockImplementation(entity => Promise.resolve(entity));
            taxGroupRepo.findOne.mockResolvedValue(null);
            taxGroupRepo.save.mockImplementation(entity => Promise.resolve(entity));
            reportRepo.save.mockImplementation(entity => Promise.resolve(entity));
        }

        it('PURCHASE: appComissionAmount totalSaleAmount\'a eklenir', async () => {
            setupExpenseRepoEmpty();
            const payment = makePayment({ type: 'PURCHASE', items: [{ ...makePayment().items[0], appComissionAmount: 100 }] });
            const report = makePlatformReport();

            await service.digestComissionIncomeForReport(report, payment);

            expect(report.totalSaleAmount).toBe(100);
        });

        it('PURCHASE: komisyon vergisi % formülüyle hesaplanır: taxAmount = comission * percent/(percent+100)', async () => {
            setupExpenseRepoEmpty();
            // %18 → taxMax = 18/118 ≈ 0.15254...
            const payment = makePayment({ type: 'PURCHASE', items: [{ ...makePayment().items[0], appComissionAmount: 118 }] });
            const report = makePlatformReport();

            await service.digestComissionIncomeForReport(report, payment);

            // taxAmount = 118 * 18/118 = 18
            expect(report.totalSaleTaxAmount).toBeCloseTo(18, 5);
        });

        it('REFUND: appComissionAmount totalRefundAmount\'a eklenir', async () => {
            setupExpenseRepoEmpty();
            const payment = makePayment({ type: 'REFUND', items: [{ ...makePayment().items[0], appComissionAmount: 50 }] });
            const report = makePlatformReport();

            await service.digestComissionIncomeForReport(report, payment);

            expect(report.totalRefundAmount).toBe(50);
        });

        it('[BUG FIX] accountId filter ile hiç item eşleşmezse paymentCount artmaz', async () => {
            setupExpenseRepoEmpty();
            const payment = makePayment({
                items: [{ ...makePayment().items[0], sellerAccountId: 'baska-satici' }],
            });
            const report = makePlatformReport();

            await service.digestComissionIncomeForReport(report, payment, 'seller-1');

            expect(report.paymentCount).toBe(0);
        });

        it('accountId filter eşleşince paymentCount 1 artar', async () => {
            setupExpenseRepoEmpty();
            const payment = makePayment({ items: [{ ...makePayment().items[0], sellerAccountId: 'seller-1', appComissionAmount: 100 }] });
            const report = makePlatformReport();

            await service.digestComissionIncomeForReport(report, payment, 'seller-1');

            expect(report.paymentCount).toBe(1);
        });

        it('accountId yokken (PLATFORM raporu) tüm itemlar işlenir, paymentCount 1 artar', async () => {
            setupExpenseRepoEmpty();
            const payment = makePayment({
                items: [
                    { ...makePayment().items[0], sellerAccountId: 'satici-A', appComissionAmount: 60 },
                    { ...makePayment().items[0], id: 'item-2', sellerAccountId: 'satici-B', appComissionAmount: 40 },
                ],
            });
            const report = makePlatformReport();

            await service.digestComissionIncomeForReport(report, payment);

            expect(report.totalSaleAmount).toBe(100);
            expect(report.paymentCount).toBe(1);
        });

        it('[BUG FIX] netRevenueWithoutExpense, masraf kaydedildikten sonra doğru hesaplanır', async () => {
            // expense (REPORT_TOTAL) = 20 TL olarak zaten kayıtlı olsun
            const existingTotalExpense = Object.assign(new ReportExpense(), { expenseKey: REPORT_TOTAL, expenseAmount: 20 });
            expenseRepo.findOne.mockImplementation(({ where }: any) => {
                if (where.expenseKey === PLATFORM_COMISSION_TOTAL) return Promise.resolve(null);
                if (where.expenseKey === REPORT_TOTAL) return Promise.resolve(null);
                return Promise.resolve(null);
            });
            // save sonucunda REPORT_TOTAL için 100 dönsün (ilk komisyon 100)
            expenseRepo.save.mockImplementation((entity: any) => {
                if (entity && entity.expenseKey === REPORT_TOTAL) {
                    entity.expenseAmount = 100;
                }
                return Promise.resolve(entity);
            });
            taxGroupRepo.findOne.mockResolvedValue(null);
            taxGroupRepo.save.mockImplementation(e => Promise.resolve(e));
            reportRepo.save.mockImplementation(e => Promise.resolve(e));

            const payment = makePayment({ type: 'PURCHASE', items: [{ ...makePayment().items[0], appComissionAmount: 100 }] });
            const report = makePlatformReport();
            report.netRevenue = 0;   // save'den önce hesaplansın
            report.netSaleAmount = 0;

            await service.digestComissionIncomeForReport(report, payment);

            // netRevenueWithoutExpense = netRevenue - totalExpense
            // totalExpense = 100 (save'den dönen expenseAmount)
            expect(report.totalExpense).toBe(100);
            expect(report.netRevenueWithoutExpense).toBe(AmountCalculationUtil.minusNumberValues(report.netRevenue, 100));
            expect(report.netRevenueWithoutExpenseTaxed).toBe(AmountCalculationUtil.minusNumberValues(report.netSaleAmount, 100));
        });

        it('komisyon expense REPORT_TOTAL ve PLATFORM_COMISSION_TOTAL\'e yazılır', async () => {
            expenseRepo.findOne.mockResolvedValue(null);
            expenseRepo.save.mockImplementation(e => Promise.resolve(e));
            taxGroupRepo.findOne.mockResolvedValue(null);
            taxGroupRepo.save.mockImplementation(e => Promise.resolve(e));
            reportRepo.save.mockImplementation(e => Promise.resolve(e));

            const payment = makePayment({ type: 'PURCHASE', items: [{ ...makePayment().items[0], appComissionAmount: 75 }] });
            const report = makePlatformReport();

            await service.digestComissionIncomeForReport(report, payment);

            const savedExpenseKeys = expenseRepo.save.mock.calls.map((call: any) => call[0]?.expenseKey);
            expect(savedExpenseKeys).toContain(PLATFORM_COMISSION_TOTAL);
            expect(savedExpenseKeys).toContain(REPORT_TOTAL);
        });
    });

    // ─────────────────────────────────────────────────────────────
    // updateExpensesForReport (private - any cast)
    // ─────────────────────────────────────────────────────────────
    describe('updateExpensesForReport (private)', () => {
        const svc = () => service as any;

        beforeEach(() => {
            expenseRepo.find.mockResolvedValue([]);
            expenseRepo.save.mockImplementation((arr: any) => Promise.resolve(arr));
        });

        it('PURCHASE: itemClass için ITEM_CLASS_COMISSION girişi oluşturur', async () => {
            const payment = makePayment({ type: 'PURCHASE', items: [{ ...makePayment().items[0], itemClass: 'ELECTRONICS', appComissionAmount: 50 }] });

            await svc().updateExpensesForReport('report-1', payment, 'seller-1', 'seller-1');

            const saved: ReportExpense[] = expenseRepo.save.mock.calls[0][0];
            const itemClassEntry = saved.find(e => e.expenseKey === ITEM_CLASS_COMISSION_PREFIX + 'ELECTRONICS');
            expect(itemClassEntry).toBeDefined();
            expect(itemClassEntry!.expenseAmount).toBe(50);
        });

        it('PURCHASE: PLATFORM_COMISSION_TOTAL ve REPORT_TOTAL oluşturulur', async () => {
            const payment = makePayment({ type: 'PURCHASE', items: [{ ...makePayment().items[0], appComissionAmount: 120 }] });

            await svc().updateExpensesForReport('report-1', payment, 'seller-1', 'seller-1');

            const saved: ReportExpense[] = expenseRepo.save.mock.calls[0][0];
            const comissionTotal = saved.find(e => e.expenseKey === PLATFORM_COMISSION_TOTAL);
            const reportTotal = saved.find(e => e.expenseKey === REPORT_TOTAL);
            expect(comissionTotal?.expenseAmount).toBe(120);
            expect(reportTotal?.expenseAmount).toBe(120);
        });

        it('REFUND: REPORT_TOTAL mevcut expense\'den çıkarılır', async () => {
            // Mevcut REPORT_TOTAL = 200
            expenseRepo.find.mockResolvedValue([
                Object.assign(new ReportExpense(), { expenseKey: REPORT_TOTAL, expenseAmount: 200 }),
                Object.assign(new ReportExpense(), { expenseKey: PLATFORM_COMISSION_TOTAL, expenseAmount: 200 }),
            ]);

            const payment = makePayment({ type: 'REFUND', items: [{ ...makePayment().items[0], appComissionAmount: 50 }] });

            await svc().updateExpensesForReport('report-1', payment, 'seller-1', 'seller-1');

            const saved: ReportExpense[] = expenseRepo.save.mock.calls[0][0];
            const reportTotal = saved.find(e => e.expenseKey === REPORT_TOTAL);
            expect(reportTotal?.expenseAmount).toBe(150); // 200 - 50
        });

        it('itemFilterAccountId null ise tüm satıcıların itemları işlenir', async () => {
            const payment = makePayment({
                type: 'PURCHASE',
                items: [
                    { ...makePayment().items[0], sellerAccountId: 'satici-A', appComissionAmount: 30 },
                    { ...makePayment().items[0], id: 'item-2', sellerAccountId: 'satici-B', appComissionAmount: 70 },
                ],
            });

            await svc().updateExpensesForReport('report-1', payment, 'platform', null);

            const saved: ReportExpense[] = expenseRepo.save.mock.calls[0][0];
            const reportTotal = saved.find(e => e.expenseKey === REPORT_TOTAL);
            expect(reportTotal?.expenseAmount).toBe(100); // 30 + 70
        });

        it('item sellerAccountId filtreye uymuyorsa atlanır', async () => {
            const payment = makePayment({
                type: 'PURCHASE',
                items: [
                    { ...makePayment().items[0], sellerAccountId: 'seller-1', appComissionAmount: 40 },
                    { ...makePayment().items[0], id: 'item-2', sellerAccountId: 'baska-satici', appComissionAmount: 60 },
                ],
            });

            await svc().updateExpensesForReport('report-1', payment, 'seller-1', 'seller-1');

            const saved: ReportExpense[] = expenseRepo.save.mock.calls[0][0];
            const reportTotal = saved.find(e => e.expenseKey === REPORT_TOTAL);
            expect(reportTotal?.expenseAmount).toBe(40); // sadece seller-1'in item'ı
        });

        it('tüm expense\'ler tek bir save çağrısında kaydedilir (N+1 yok)', async () => {
            const payment = makePayment({
                type: 'PURCHASE',
                items: [
                    { ...makePayment().items[0], sellerAccountId: 'seller-1', appComissionAmount: 10, itemClass: 'A' },
                    { ...makePayment().items[0], id: 'item-2', sellerAccountId: 'seller-1', appComissionAmount: 20, itemClass: 'B' },
                ],
            });

            await svc().updateExpensesForReport('report-1', payment, 'seller-1', 'seller-1');

            // updateExpensesForReport sonunda tek bir save çağrısı yapmalı
            expect(expenseRepo.save).toHaveBeenCalledTimes(1);
        });
    });

    // ─────────────────────────────────────────────────────────────
    // reportCalculationByPaymentItems (private - any cast)
    // ─────────────────────────────────────────────────────────────
    describe('reportCalculationByPaymentItems (private)', () => {
        const svc = () => service as any;

        function emptyBaseReport() {
            return {
                paymentCount: 0,
                totalSaleAmount: 0,
                totalRefundAmount: 0,
                totalSaleTaxAmount: 0,
                totalRefundTaxAmount: 0,
                netTaxAmount: 0,
                netSaleAmount: 0,
                netRevenue: 0,
            };
        }

        it('PURCHASE: totalSaleAmount, totalSaleTaxAmount ve paymentCount artar', async () => {
            const report = emptyBaseReport();
            const items = [{ sellerAccountId: 'seller-1', totalAmount: 1000, taxAmount: 180 }];

            await svc().reportCalculationByPaymentItems(report, 'PURCHASE', items, 'seller-1');

            expect(report.totalSaleAmount).toBe(1000);
            expect(report.totalSaleTaxAmount).toBe(180);
            expect(report.paymentCount).toBe(1);
        });

        it('PURCHASE: netSaleAmount ve netRevenue türetilir', async () => {
            const report = emptyBaseReport();
            const items = [{ sellerAccountId: 's1', totalAmount: 1000, taxAmount: 180 }];

            await svc().reportCalculationByPaymentItems(report, 'PURCHASE', items, 's1');

            // netSaleAmount = totalSaleAmount - totalRefundAmount = 1000
            // netTaxAmount = totalSaleTaxAmount - totalRefundTaxAmount = 180
            // netRevenue = netSaleAmount - netTaxAmount = 820
            expect(report.netSaleAmount).toBe(1000);
            expect(report.netTaxAmount).toBe(180);
            expect(report.netRevenue).toBe(820);
        });

        it('REFUND: totalRefundAmount artar', async () => {
            const report = emptyBaseReport();
            const items = [{ sellerAccountId: 's1', totalAmount: 500, taxAmount: 90 }];

            await svc().reportCalculationByPaymentItems(report, 'REFUND', items, 's1');

            expect(report.totalRefundAmount).toBe(500);
            expect(report.totalRefundTaxAmount).toBe(90);
        });

        it('accountId null ise hiçbir filtre uygulanmaz', async () => {
            const report = emptyBaseReport();
            const items = [
                { sellerAccountId: 'satici-A', totalAmount: 400, taxAmount: 72 },
                { sellerAccountId: 'satici-B', totalAmount: 600, taxAmount: 108 },
            ];

            await svc().reportCalculationByPaymentItems(report, 'PURCHASE', items, null);

            expect(report.totalSaleAmount).toBe(1000);
        });

        it('çok item: toplamlar doğru biriktirilir', async () => {
            const report = emptyBaseReport();
            const items = [
                { sellerAccountId: 's1', totalAmount: 300, taxAmount: 54 },
                { sellerAccountId: 's1', totalAmount: 700, taxAmount: 126 },
            ];

            await svc().reportCalculationByPaymentItems(report, 'PURCHASE', items, 's1');

            expect(report.totalSaleAmount).toBe(1000);
            expect(report.totalSaleTaxAmount).toBe(180);
        });
    });
});
