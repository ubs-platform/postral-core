import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { In, Not, Repository } from 'typeorm';
import { Report, ReportQuery, ReportComission, ReportTaxGroup, PaymentChannelOperation, ReportPaymentRelation, ReportExpense, ReportPlatform, ExternalPlatform } from '@tk-postral/postral-entities';
import { BaseReport, ITEM_CLASS_COMISSION_PREFIX, PaymentFullDTO, PLATFORM_COMISSION_TOTAL, EXTERNAL_PLATFORM_COMISSION_PREFIX, EXTERNAL_ITEM_CLASS_COMISSION_PREFIX, PAYMENT_SERVICE_FEE, PAYMENT_CHANNEL_FEE_PREFIX, REPORT_TOTAL, ReportDateGrouping, ReportType, POSTRAL_INSTANCE } from '@tk-postral/payment-common';
import { AmountCalculationUtil } from '@tk-postral/common-utils';
import { PaymentCommonService } from './payment-common.service';
import { Cron } from '@nestjs/schedule';
import { randomUUID } from 'crypto';
import { AppComissionService } from './app-commission.service';
import { SellerPaymentOrderSearchService } from './transaction-search.service';
import { PaymentItemDTO } from '@tk-postral/payment-common';
import { AdminSettingsService } from './admin-settings.service';
import { exec } from 'child_process';
import { EventSenderService } from './event-management.service';
import { ReportItem } from '@tk-postral/postral-entities/entity/report-item.entity';
import { SellerReportSetupService } from './seller-report-setup.service';
import { REFUND_ROUNDING_ADJUSTMENT } from '@tk-postral/payment-common';
import Big from 'big.js';

@Injectable()
export class ReportDigestionService {

    private readonly logger = new Logger(ReportDigestionService.name);
    private reportsFetchInflight = new Map<string, Promise<Report>>();
    checkingRelations: any;

    constructor(
        @InjectRepository(Report)
        private readonly reportRepo: Repository<Report>,
        @InjectRepository(ReportQuery)
        private readonly queryRepo: Repository<ReportQuery>,
        @InjectRepository(ReportTaxGroup)
        private readonly taxGroupRepo: Repository<ReportTaxGroup>,
        @InjectRepository(ReportPaymentRelation)
        private readonly reportPaymentRelationRepo: Repository<ReportPaymentRelation>,
        @InjectRepository(ReportExpense)
        private readonly reportExpenseRepo: Repository<ReportExpense>,
        @InjectRepository(PaymentChannelOperation)
        private readonly paymentChannelOperationRepo: Repository<PaymentChannelOperation>,
        @InjectRepository(ReportItem)
        private readonly reportItemRepo: Repository<ReportItem>,
        private readonly comissionService: AppComissionService,
        private readonly paymentCommonService: PaymentCommonService,
        private readonly sellerPaymentOrderService: SellerPaymentOrderSearchService,
        private readonly admSettings: AdminSettingsService,
        private readonly eventSenderService: EventSenderService,
        private readonly reportSetup: SellerReportSetupService,
        @InjectRepository(ReportPlatform)
        private readonly reportPlatformRepo: Repository<ReportPlatform>,
        @InjectRepository(ExternalPlatform)
        private readonly externalPlatformRepo: Repository<ExternalPlatform>,
    ) { }


    // ─────────────────────────────────────────────────────────────
    // findOrCreateByQuery
    //
    // Finds or creates a Report bucket for the given (query, periodLabel, currency).
    // Handles the race condition: if two concurrent requests try to create the
    // same row, the second insert will fail on the unique constraint. We catch
    // that and re-fetch the row that the first request created.
    // ─────────────────────────────────────────────────────────────
    async findOrCreateByQuery(
        query: ReportQuery,
        periodLabel: string,
        currency: string,
    ): Promise<Report> {
        const cacheKey = `${query.id}_${periodLabel}_${currency}`;
        if (this.reportsFetchInflight.has(cacheKey)) {
            return this.reportsFetchInflight.get(cacheKey)!;
        }

        const where = { queryId: query.id, periodLabel, currency, archived: false };
        const existing = await this.reportRepo.findOne({ where });
        if (existing) return existing;
        if (query.ownerAccountId == null) {
            throw new Error(`Query ${query.id} has no ownerAccountId, cannot create report`);
        }
        const reportPromise = (async () => {
            try {
                const reportNew = new Report();
                reportNew.queryId = query.id;
                reportNew.periodLabel = periodLabel;
                reportNew.currency = currency;
                // reportNew.accountId = query.ownerAccountId!;
                reportNew.reportType = query.reportType;
                return await this.reportRepo.save(reportNew);
            } catch (err: any) {
                // Race condition: başka bir instance aynı anda insert etmiş olabilir.
                // Unique constraint ihlali durumunda tekrar fetch edip döndürüyoruz.
                const reFetched = await this.reportRepo.findOne({ where });
                if (reFetched) return reFetched;
                throw err;
            }
        })();

        this.reportsFetchInflight.set(cacheKey, reportPromise);
        try {
            return await reportPromise;
        } finally {
            this.reportsFetchInflight.delete(cacheKey);
        }

    }

    insertPaymentToReportDigestionQueue(payment: PaymentFullDTO) {
        this.eventSenderService.sendDigestionQueueInsertionEvent(payment.id);
    }



    private async updatePaymentItemReport(reportId: string, payment: PaymentFullDTO, accountId?: string): Promise<void> {

        const itemsMappedByKey = new Map<string, ReportItem>();
        const reportAccountId = accountId ?? "PLATFORM";

        for (const paymentItem of payment.items) {
            if (accountId != null && paymentItem.sellerAccountId !== accountId) {
                continue;
            }

            // DİKKAT: Burada itemId'yi paymentItem.itemId olarak kullanıyoruz. paymentItem.id payment item kaydının idsi, burada lazım olan şey gerçek item idsi
            const key = ReportItem.generateKey(reportId, paymentItem.itemId, paymentItem.variation, paymentItem.name);
            let reportItem = itemsMappedByKey.get(key) ?? await this.reportItemRepo.findOne({
                where: { reportItemKey: key, reportId, accountId: reportAccountId }
            });
            if (!reportItem) {
                reportItem = new ReportItem();
                reportItem.reportItemKey = key;
                reportItem.reportId = reportId;
                reportItem.itemId = paymentItem.itemId;
                reportItem.identifiedByName = !paymentItem.itemId?.trim();
                reportItem.itemName = paymentItem.name;
                reportItem.itemVariation = paymentItem.variation ?? "";
                reportItem.accountId = reportAccountId;
                reportItem = await this.reportItemRepo.save(reportItem);
            }
            if (reportItem) {
                itemsMappedByKey.set(key, reportItem);
            }
            const differenceFromRealUnit =
                AmountCalculationUtil.minusNumberValues(
                    paymentItem.totalAmount,
                    AmountCalculationUtil.multiplyNumberValues(paymentItem.originalUnitAmount, paymentItem.quantity)
                );

            // console.info("Difference from real unit:", differenceFromRealUnit);
            // console.info("Orjinal halsinde:", paymentItem.originalUnitAmount, paymentItem.quantity);
            if (payment.type === "PURCHASE") {
                reportItem.purchasedQuantity = AmountCalculationUtil.addNumberValues(reportItem.purchasedQuantity, paymentItem.quantity);
                reportItem.purchasedTotalAmount = AmountCalculationUtil.addNumberValues(reportItem.purchasedTotalAmount, paymentItem.totalAmount);
                reportItem.purchasedComissionAmount = AmountCalculationUtil.addNumberValues(reportItem.purchasedComissionAmount, paymentItem.appComissionAmount);
                reportItem.purchasedTaxAmount = AmountCalculationUtil.addNumberValues(reportItem.purchasedTaxAmount, paymentItem.taxAmount);
                reportItem.purchasedDiscountAmount = AmountCalculationUtil.addNumberValues(reportItem.purchasedDiscountAmount, differenceFromRealUnit);
            }

            if (payment.type === "REFUND") {
                reportItem.refundedQuantity = AmountCalculationUtil.addNumberValues(reportItem.refundedQuantity, paymentItem.quantity);
                reportItem.refundedTotalAmount = AmountCalculationUtil.addNumberValues(reportItem.refundedTotalAmount, paymentItem.totalAmount);
                reportItem.refundedComissionAmount = AmountCalculationUtil.addNumberValues(reportItem.refundedComissionAmount, paymentItem.appComissionAmount);
                reportItem.refundedTaxAmount = AmountCalculationUtil.addNumberValues(reportItem.refundedTaxAmount, paymentItem.taxAmount);
                reportItem.refundedDiscountAmount = AmountCalculationUtil.addNumberValues(reportItem.refundedDiscountAmount, differenceFromRealUnit);
            }

            reportItem.itemComissionAmount = AmountCalculationUtil.minusNumberValues(reportItem.purchasedComissionAmount, reportItem.refundedComissionAmount);
            reportItem.itemTaxAmount = AmountCalculationUtil.minusNumberValues(reportItem.purchasedTaxAmount, reportItem.refundedTaxAmount);
            // FIXME: İndirim hesaplarken eksik çıkıyor olabilir tam da kestiremedim
            // TODO: Atıyorum 3 al bir öde tarzı bir indirim mantığını burada hesaba katmamız gerekebilir.
            // Bunu Core içinde değil de pro içine alabilirim.  Biraz biz de para kazanalım :d 
            reportItem.itemDiscountAmount = AmountCalculationUtil.minusNumberValues(reportItem.purchasedDiscountAmount, reportItem.refundedDiscountAmount);
            reportItem.itemTotalAmount = AmountCalculationUtil.minusNumberValues(reportItem.purchasedTotalAmount, reportItem.refundedTotalAmount);
            reportItem.itemQuantity = AmountCalculationUtil.minusNumberValues(reportItem.purchasedQuantity, reportItem.refundedQuantity);

          
            await this.reportItemRepo.save(reportItem);


        }
    }



    private async resolveReportPlatform(payment: PaymentFullDTO, platforms: Map<string, ExternalPlatform>): Promise<Pick<ReportPlatform, 'platformKey' | 'platformName' | 'externalPlatformId'>> {
        if (!payment.externalPlatformId) {
            return { platformKey: POSTRAL_INSTANCE, platformName: 'Postral' };
        }
        let platform = platforms.get(payment.externalPlatformId);
        if (!platform) {
            platform = await this.externalPlatformRepo.findOneBy({ id: payment.externalPlatformId }) ?? undefined;
            if (!platform?.code?.trim() || platform.code === POSTRAL_INSTANCE) {
                throw new Error(`Payment ${payment.id} has a missing or invalid external platform ${payment.externalPlatformId}`);
            }
            platforms.set(platform.id, platform);
        }
        return { platformKey: platform.code, platformName: platform.name, externalPlatformId: platform.id };
    }

    private async updatePlatformReport(
        reportId: string,
        payment: PaymentFullDTO,
        platform: Pick<ReportPlatform, 'platformKey' | 'platformName' | 'externalPlatformId'>,
        accountId?: string,
    ): Promise<void> {
        const items = accountId == null ? payment.items : payment.items.filter(item => item.sellerAccountId === accountId);
        if (items.length === 0) return;
        if (payment.type !== 'PURCHASE' && payment.type !== 'REFUND') {
            throw new Error(`Unsupported report payment type ${payment.type} for payment ${payment.id}`);
        }
        const where = { reportId, accountId: accountId ?? 'PLATFORM', platformKey: platform.platformKey };
        let row = await this.reportPlatformRepo.findOne({ where });
        if (!row) {
            row = Object.assign(new ReportPlatform(), where, platform);
        }
        if ((row.externalPlatformId ?? null) !== (platform.externalPlatformId ?? null)) {
            throw new Error(`Platform key ${platform.platformKey} conflicts with an existing source in report ${reportId}`);
        }
        if (payment.type === 'PURCHASE') {
            row.purchaseCount = AmountCalculationUtil.addNumberValues(row.purchaseCount, 1);
        } else {
            row.refundCount = AmountCalculationUtil.addNumberValues(row.refundCount, 1);
        }
        for (const item of items) {
            if (payment.type === 'PURCHASE') {
                row.soldQuantity = AmountCalculationUtil.addNumberValues(row.soldQuantity, item.quantity);
                row.totalSaleAmount = AmountCalculationUtil.addNumberValues(row.totalSaleAmount, item.totalAmount);
                row.totalSaleTaxAmount = AmountCalculationUtil.addNumberValues(row.totalSaleTaxAmount, item.taxAmount);
            } else {
                row.refundedQuantity = AmountCalculationUtil.addNumberValues(row.refundedQuantity, item.quantity);
                row.totalRefundAmount = AmountCalculationUtil.addNumberValues(row.totalRefundAmount, item.totalAmount);
                row.totalRefundTaxAmount = AmountCalculationUtil.addNumberValues(row.totalRefundTaxAmount, item.taxAmount);
            }
        }
        row.netSaleAmount = AmountCalculationUtil.minusNumberValues(row.totalSaleAmount, row.totalRefundAmount);
        const netTax = AmountCalculationUtil.minusNumberValues(row.totalSaleTaxAmount, row.totalRefundTaxAmount);
        row.netRevenue = AmountCalculationUtil.minusNumberValues(row.netSaleAmount, netTax);
        await this.reportPlatformRepo.save(row);
    }

    // ─────────────────────────────────────────────────────────────
    // insertPaymentToReportDigestionQueue
    //
    // Called after a payment reaches COMPLETED status.
    // 1. Loads all ReportQueries that match the payment.
    // 2. For each matching query, resolves the period label.
    // 3. findOrCreate the Report bucket.
    // 4. Enqueues the payment for digestion.
    // ─────────────────────────────────────────────────────────────
    async insertPaymentToReportDigestionQueueCameFromEvent(payment: PaymentFullDTO): Promise<void> {
        const queries = await this.findMatchingQueries(payment);
        if (queries.length === 0) return;

        for (const query of queries) {
            const periodLabel = this.buildPeriodLabel(
                query.dateGrouping,
                new Date(payment.createdAt as string),
            );
            const report = await this.findOrCreateByQuery(query, periodLabel, payment.currency);
            // Mikro işlem yapmak çok daha iyi ama fazla hesaplarda bunu sürdürebilir miyim bilmiyorum. Race condition sorunları için farklı bir şey düşüneceğim ama mutlaka.
            await this.insertPaymentToReportDigestionSingle(report.id, payment.id, query.ownerAccountId!);
        }

        // arkaplanda 
        this.checkRelations().then(() => {
            console.log("Rapor ilişkileri çalıştırıldı ve bitti.");
        });
        // TODO: Komisyon geliri, masraflar için ayrıca rapor açılacak... Edit: Yaptımmmm
    }

    async insertPaymentToReportDigestionSingle(reportId: string, paymentId: string, accountId: string) {
        await this.reportPaymentRelationRepo.save({
            reportId,
            paymentId,
            digestionStatus: 'WAITING',
            accountId,
        });

        this.logger.debug(`Digested payment ${paymentId} into report ${reportId}`);
    }

    private async digestPayment(report: Report, payment: PaymentFullDTO) {
        // Taze veri: döngüde paylaşılan stale instance yerine DB'den güncel satırı çekiyoruz.
        if (report.query == null) {
            this.logger.warn(`Report ${report.id} has no query loaded`);
            return;
        }
        const accountId = report.query.ownerAccountId;
        // todo: totalExpense içindeki değeri toplam Satıştan bağımsız bir alan yaratıp güncellemek daha sağlıklı olabilir, çünkü komisyon ve diğer masraflar satıştan bağımsız olarak artabilir. Şu anki yapıda totalExpense raporun net satışından bağımsız olarak artıyor, bu da raporun okunmasını zorlaştırıyor. TotalExpense'ı sadece komisyon ve diğer masrafları içerecek şekilde güncellersek, raporun net satışını ve toplam masraflarını ayrı ayrı görebiliriz, bu da analiz yaparken daha fazla esneklik sağlar.
        await this.reportCalculation(report, payment, accountId!);
        const totalExpense = await this.reportExpenseRepo.findOne({ where: { reportId: report.id, accountId, expenseKey: REPORT_TOTAL } });
        report.totalExpense = totalExpense?.expenseAmount || 0;
        report.netRevenueWithoutExpense = AmountCalculationUtil.minusNumberValues(report.netRevenue || 0, report.totalExpense || 0);
        // Vergili hakediş: satıcı kendi vergisini ödeyeceği için vergi dahil tutar verilir (netSaleAmount - masraflar)
        report.netRevenueWithoutExpenseTaxed = AmountCalculationUtil.minusNumberValues(report.netSaleAmount || 0, report.totalExpense || 0);
        return await this.stampTimeAndSaveReport(report, payment);
    }

    private async digestPlatformFlowReport(report: Report, payment: PaymentFullDTO) {
        if (report.query == null) {
            this.logger.warn(`Report ${report.id} has no query loaded`);
            return;
        }
        for (const item of payment.items) {
            if (payment.type === 'PURCHASE') {
                report.totalSaleAmount = AmountCalculationUtil.addNumberValues(item.totalAmount, report.totalSaleAmount || 0);
                report.totalSaleTaxAmount = AmountCalculationUtil.addNumberValues(item.taxAmount, report.totalSaleTaxAmount || 0);
            } else if (payment.type === 'REFUND') {
                report.totalRefundAmount = AmountCalculationUtil.addNumberValues(item.totalAmount, report.totalRefundAmount || 0);
                report.totalRefundTaxAmount = AmountCalculationUtil.addNumberValues(item.taxAmount, report.totalRefundTaxAmount || 0);
            }
        }
        report.paymentCount = AmountCalculationUtil.addNumberValues(report.paymentCount, 1);
        report.netTaxAmount = AmountCalculationUtil.minusNumberValues(report.totalSaleTaxAmount || 0, report.totalRefundTaxAmount || 0);
        report.netSaleAmount = AmountCalculationUtil.minusNumberValues(report.totalSaleAmount || 0, report.totalRefundAmount || 0);
        report.netRevenue = AmountCalculationUtil.minusNumberValues(report.netSaleAmount || 0, report.netTaxAmount || 0);
        // if (report.query == null) {
        //     exec(`kdialog --msgbox "Dikkat! Raporun sorgusu bulunamadı. ReportId: ${report.id}"`);
        // }
        const totalExpense = await this.reportExpenseRepo.findOne({ where: { reportId: report.id, accountId: report.query?.ownerAccountId, expenseKey: REPORT_TOTAL } });
        report.totalExpense = totalExpense?.expenseAmount || 0;
        report.netRevenueWithoutExpense = AmountCalculationUtil.minusNumberValues(report.netRevenue || 0, report.totalExpense || 0);
        report.netRevenueWithoutExpenseTaxed = AmountCalculationUtil.minusNumberValues(report.netSaleAmount || 0, report.totalExpense || 0);
        return await this.stampTimeAndSaveReport(report, payment);
    }


    private async stampTimeAndSaveReport(report: Report, payment?: PaymentFullDTO): Promise<Report> {
        report.lastDigestedAt = new Date();
        if (payment) {
            report.lastDigestedPaymentId = payment.id;
        }
        return await this.reportRepo.save(report);
    }

    private async reportCalculation(report: BaseReport, payment: PaymentFullDTO, accountId: string) {
        const paymentItems = payment.items.filter(i => i.sellerAccountId === accountId);
        return await this.reportCalculationByPaymentItems(report, payment.type, paymentItems, accountId);
    }

    private async reportCalculationByPaymentItems(report: BaseReport, paymentType: string, paymentItems: PaymentItemDTO[], accountId: string | null) {

        for (const item of paymentItems) {
            if (accountId !== null && item.sellerAccountId !== accountId) continue;
            if (paymentType === 'PURCHASE') {
                report.totalSaleAmount = AmountCalculationUtil.addNumberValues(item.totalAmount, report.totalSaleAmount || 0);
                report.totalSaleTaxAmount = AmountCalculationUtil.addNumberValues(item.taxAmount, report.totalSaleTaxAmount || 0);
            } else if (paymentType === 'REFUND') {
                report.totalRefundAmount = AmountCalculationUtil.addNumberValues(item.totalAmount, report.totalRefundAmount || 0);
                report.totalRefundTaxAmount = AmountCalculationUtil.addNumberValues(item.taxAmount, report.totalRefundTaxAmount || 0);
            }
        }
        report.paymentCount = AmountCalculationUtil.addNumberValues(report.paymentCount, 1);
        report.netTaxAmount = AmountCalculationUtil.minusNumberValues(report.totalSaleTaxAmount || 0, report.totalRefundTaxAmount || 0);
        report.netSaleAmount = AmountCalculationUtil.minusNumberValues(report.totalSaleAmount || 0, report.totalRefundAmount || 0);
        report.netRevenue = AmountCalculationUtil.minusNumberValues(report.netSaleAmount || 0, report.netTaxAmount || 0);
    }

    private static expenseDisplayWeight(expenseKey: string): number {
        if (expenseKey === REPORT_TOTAL) return 1;
        if (expenseKey === PLATFORM_COMISSION_TOTAL || expenseKey === PAYMENT_SERVICE_FEE || expenseKey.startsWith(EXTERNAL_PLATFORM_COMISSION_PREFIX)) return 2;
        return 3; // ITEM_CLASS_COMISSION_*, PAYMENT_CHANNEL_FEE:* ve diğerleri
    }

    private async updateProviderFeeExpenseForReportAccountId(reportId: string, payment: PaymentFullDTO, accountId: string): Promise<void> {
        // const isPlatformReport = accountId === "PLATFORM";

        const [operations, paymentSellerOrder] = await Promise.all([
            this.paymentChannelOperationRepo.find({
                where: { paymentId: payment.id, providerFeeDebitFrom: Not('PLATFORM'), providerFee: Not(0) },
            }),
            this.sellerPaymentOrderService.findByPaymentIdAndAccountId(payment.id, accountId),
        ]);


        const sellerItemsTotal = paymentSellerOrder?.amount ?? 0;
        if (sellerItemsTotal <= 0 || payment.totalAmount <= 0) return;
        const ratio = AmountCalculationUtil.divideNumberValues(sellerItemsTotal, payment.totalAmount);

        const fees = operations.map(operation => ({
            paymentChannelId: operation.paymentChannelId,
            amount: AmountCalculationUtil.multiplyNumberValues(operation.providerFee, ratio),
        }));
        await this.addProviderFeeExpenses(reportId, accountId, fees);
    }

    /**
     * Ödeme hizmeti ücretlerini PAYMENT_SERVICE_FEE (toplam), kanal bazlı PAYMENT_CHANNEL_FEE:{kanal}
     * alt kırılımı ve REPORT_TOTAL'a yazar. Alt kırılım REPORT_TOTAL'a ikinci kez eklenmez.
     */
    private async addProviderFeeExpenses(reportId: string, accountId: string, fees: { paymentChannelId: string; amount: number }[]): Promise<void> {
        const positiveFees = fees.filter(fee => fee.amount > 0);
        if (positiveFees.length === 0) return;

        const existing = await this.reportExpenseRepo.find({ where: { reportId, accountId } });
        const expenseMap = new Map(existing.map(e => [e.expenseKey, e]));
        const addTo = (expenseKey: string, amount: number) => {
            let expense = expenseMap.get(expenseKey);
            if (!expense) {
                expense = ReportExpense.create(reportId, accountId, expenseKey, 0, undefined, true, ReportDigestionService.expenseDisplayWeight(expenseKey));
                expenseMap.set(expenseKey, expense);
            }
            expense.expenseAmount = AmountCalculationUtil.addNumberValues(expense.expenseAmount, amount);
            return expense;
        };

        const changed = new Set<ReportExpense>();
        for (const fee of positiveFees) {
            changed.add(addTo(PAYMENT_SERVICE_FEE, fee.amount));
            changed.add(addTo(PAYMENT_CHANNEL_FEE_PREFIX + encodeURIComponent(fee.paymentChannelId), fee.amount));
            changed.add(addTo(REPORT_TOTAL, fee.amount));
        }
        await this.reportExpenseRepo.save(Array.from(changed));
    }

    private async updateProviderFeeExpenseForPlatformReport(reportId: string, payment: PaymentFullDTO): Promise<void> {
        // providerFeeDebitFrom: 'PLATFORM' olarak filtrelemek ilk başta mantıklı geldi ama satıcı ödediği zaman 
        // sadece bu kadar miktarı sadece satıcıdan kesiyoruz. 
        // Bir nevi aracı oluyoruz ve hakedişten de düşüyoruz. 
        // Satıcının ödemesi demek sadece satıcıdan o kadar miktarı kesmemiz demek. O yüzden providerFeeDebitFrom alanına bakmadan, providerFee'si 0 olmayan tüm operasyonları 
        // alarak kendi hanemize yazmamız gerekiyor.
        const operations = await this.paymentChannelOperationRepo.find({
            where: { paymentId: payment.id, providerFee: Not(0) },
        });
        await this.addProviderFeeExpenses(reportId, 'PLATFORM', operations.map(operation => ({
            paymentChannelId: operation.paymentChannelId,
            amount: operation.providerFee,
        })));
    }

    private async updateRefundRoundingExpense(report: Report, payment: PaymentFullDTO): Promise<void> {
        if (payment.type === 'REFUND') {
            const accountId = report.query?.ownerAccountId;
            if (!accountId) throw new Error('Refund rounding report requires an owner account');
            const refunds = await this.paymentChannelOperationRepo.find({
                where: { paymentId: payment.id, operationType: 'REFUND' },
            });
            const adjustment = refunds.reduce((sum, operation) => sum.plus(
                (operation.refundPlan?.lines ?? [])
                    .filter(line => operation.settledRefundItemIds?.includes(line.originalPaymentItemId))
                    .reduce((total, line) => total.plus(new Big(line.providerAmount).minus(line.nominalAmount)), new Big(0)),
            ), new Big(0));
            if (!adjustment.eq(0)) {
                const expenses = await this.reportExpenseRepo.find({ where: { reportId: report.id, accountId } });
                const changed = [REFUND_ROUNDING_ADJUSTMENT, REPORT_TOTAL].map(key => {
                    const expense = expenses.find(entry => entry.expenseKey === key) ??
                        ReportExpense.create(report.id, accountId, key, 0, undefined, true, key === REPORT_TOTAL ? 1 : 2);
                    expense.expenseAmount = Number(new Big(expense.expenseAmount).plus(adjustment));
                    return expense;
                });
                await this.reportExpenseRepo.save(changed);
                report.totalExpense = changed[1].expenseAmount;
            }
        }
    }

    private async updateExpensesForReport(mainReportId: string, payment: PaymentFullDTO, expenseAccountId: string, itemFilterAccountId: string | null = expenseAccountId, platforms = new Map<string, ExternalPlatform>()) {
        const platformCode = payment.externalPlatformId
            ? encodeURIComponent((await this.resolveReportPlatform(payment, platforms)).platformKey)
            : undefined;
        const totalComissionExpenseKey = platformCode == null
            ? PLATFORM_COMISSION_TOTAL
            : EXTERNAL_PLATFORM_COMISSION_PREFIX + platformCode;

        // Eğer birden fazla instance bir rapora işleseydi, bu yapı daha doğru olurdu. Ancak tek bir rapor tek bir instance işleyeceği için burada expense'leri bir 
        // anda çekip güncelleyebilirim, böylece performans artışı sağlanır. 
        // Eğer birden fazla instance aynı raporu işleyebilseydi, her expense güncellemesi için fetchOrCreate yapmak zorunda kalırdım, bu da performansı ciddi şekilde düşürürdü.

        const allExpenses = await this.reportExpenseRepo.find({
            where: { reportId: mainReportId, accountId: expenseAccountId },
        });
        const expenseMap = new Map(allExpenses.map(e => [e.expenseKey, e]));

        // Eğer payment type PURCHASE ise, masraflar artacak, REFUND ise masraflar azalacak, çünkü iade durumunda komisyon iadesi de oluyor.
        const action = payment.type === "PURCHASE" ? AmountCalculationUtil.addNumberValues : AmountCalculationUtil.minusNumberValues;


        for (let index = 0; index < payment.items.length; index++) {
            const item = payment.items[index];
            if (itemFilterAccountId !== null && item.sellerAccountId !== itemFilterAccountId) continue;

            if (item.itemClass) {
                const expenseKey = platformCode == null
                    ? ITEM_CLASS_COMISSION_PREFIX + item.itemClass
                    : EXTERNAL_ITEM_CLASS_COMISSION_PREFIX + platformCode + ':' + encodeURIComponent(item.itemClass);
                let itemClassExpenseReport = expenseMap.get(expenseKey);
                if (!itemClassExpenseReport) {
                    itemClassExpenseReport = ReportExpense.create(mainReportId, expenseAccountId, expenseKey, 0, item.itemClass, true, ReportDigestionService.expenseDisplayWeight(expenseKey));
                    expenseMap.set(expenseKey, itemClassExpenseReport);
                    if (itemClassExpenseReport.expenseKey == null || itemClassExpenseReport.expenseKey === "") {
                        debugger;
                        throw new Error("Expense key cannot be null or empty");

                    }
                }

                itemClassExpenseReport.expenseAmount = action(itemClassExpenseReport.expenseAmount, item.appComissionAmount);

                // await this.reportExpenseRepo.save(itemClassExpenseReport);
            }

            let totalComissionExpenseReport = expenseMap.get(totalComissionExpenseKey);


            if (!totalComissionExpenseReport) {
                totalComissionExpenseReport = ReportExpense.create(mainReportId, expenseAccountId, totalComissionExpenseKey, 0, undefined, true, ReportDigestionService.expenseDisplayWeight(totalComissionExpenseKey));
                expenseMap.set(totalComissionExpenseKey, totalComissionExpenseReport);
            }


            if (totalComissionExpenseReport.expenseKey == null || totalComissionExpenseReport.expenseKey === "") {
                debugger;
                throw new Error("Expense key cannot be null or empty");
            }

            totalComissionExpenseReport.expenseAmount = action(totalComissionExpenseReport.expenseAmount, item.appComissionAmount);

            const reportTotalExpenseKey = REPORT_TOTAL;
            let reportTotalExpenseReport = expenseMap.get(reportTotalExpenseKey);
            if (!reportTotalExpenseReport) {
                reportTotalExpenseReport = ReportExpense.create(mainReportId, expenseAccountId, reportTotalExpenseKey, 0, undefined, true, ReportDigestionService.expenseDisplayWeight(reportTotalExpenseKey));
                expenseMap.set(reportTotalExpenseKey, reportTotalExpenseReport);
            }

            reportTotalExpenseReport.expenseAmount = action(reportTotalExpenseReport.expenseAmount, item.appComissionAmount);
            // await this.reportExpenseRepo.save(reportTotalExpenseReport);
        }
        await this.reportExpenseRepo.save(Array.from(expenseMap.values()));

    }

    private async updateTaxGroupReportByPaymentAndAccountId(mainReportId: string, payment: PaymentFullDTO, accountId: string | null) {
        const paymentItemsPerTaxGroup: { [taxGroup: string]: PaymentItemDTO[] } = {};
        for (let index = 0; index < payment.items.length; index++) {
            // Payment itemleri dolaşarak tax percentleri almam gerekiyor çünkü paymentta diğer satıcılarla ilgili bilgi olabilir...
            const item = payment.items[index];
            if (accountId !== null && item.sellerAccountId !== accountId) continue;

            const percentGroup = item.taxPercent ?? 0;


            if (!paymentItemsPerTaxGroup[percentGroup]) {
                paymentItemsPerTaxGroup[percentGroup] = [];
            }
            paymentItemsPerTaxGroup[percentGroup].push(item);
        }
        for (const percentGroup in paymentItemsPerTaxGroup) {
            let taxGroupReport = await this.taxGroupRepo.findOne({ where: { reportId: mainReportId, taxPercent: percentGroup, currency: payment.currency } });
            const realtaxGroupLabel = percentGroup ? `Tax ${percentGroup}%` : 'No Tax';
            if (!taxGroupReport) {
                taxGroupReport = new ReportTaxGroup();
                taxGroupReport.taxPercent = percentGroup;
                taxGroupReport.reportId = mainReportId;
                taxGroupReport.taxGroupName = realtaxGroupLabel;
                taxGroupReport.currency = payment.currency;
            }
            const itemsInGroup = paymentItemsPerTaxGroup[percentGroup];
            await this.reportCalculationByPaymentItems(taxGroupReport, payment.type, itemsInGroup, accountId);
            await this.taxGroupRepo.save(taxGroupReport);
        }
    }


    async isBusy(): Promise<boolean> {
        const count = await this.reportPaymentRelationRepo.count({ where: { digestionStatus: Not("COMPLETED") } });
        return count > 0;
    }

    /**
     * 
     * @param platformReport 
     * @param payment 
     * @param accountId Eğer account id varsa filtrelenir, yoksa filtrelenmez. Bu da 
     * @returns 
     */
    async digestComissionIncomeForReport(platformReport: Report, payment: PaymentFullDTO, accountId?: string) {

        if (payment.externalPlatformId) {
            // TODO: External platform için komisyonları ayrı hesapla...
            return;

        }
        const adminSettings = await this.admSettings.getAdminSettings();

        if (platformReport.query == null) {
            this.logger.warn(`Report ${platformReport.id} has no query loaded, cannot digest commission`);
            return;
        }
        // let totalComission = 0;
        const percent = adminSettings.comissionItemTax?.variations?.[0]?.taxRate || 0;
        if (percent === 0) {
            this.logger.warn("Comission Item Tax is not set in Admin Settings, defaulting to 0%");
        }
        const taxMax = AmountCalculationUtil.divideNumberValues(percent, AmountCalculationUtil.addNumberValues(percent, 100));
        let currentComissionTotal = 0, currentComissionTaxTotal = 0, refundComissionTotal = 0, refundComissionTaxTotal = 0;
        let processedItemCount = 0;
        for (const item of payment.items) {
            // Eğer accountId varsa, sadece o satıcının ürünleri üzerinden komisyon hesaplanır, 
            // yoksa tüm ürünler üzerinden hesaplanır. Çünkü platform raporlarında tüm ürünlerin komisyonunu göstermek 
            // isteyebilirim, seller raporlarında ise sadece ilgili satıcının komisyonunu göstermek isteyebilirim.
            if (accountId && item.sellerAccountId !== accountId) continue;

            processedItemCount++;
            if (payment.type === 'PURCHASE') {
                currentComissionTotal = AmountCalculationUtil.addNumberValues(item.appComissionAmount, currentComissionTotal);
                platformReport.totalSaleAmount = AmountCalculationUtil.addNumberValues(item.appComissionAmount, platformReport.totalSaleAmount || 0);
                const taxAmount = AmountCalculationUtil.multiplyNumberValues(item.appComissionAmount, taxMax);
                currentComissionTaxTotal = AmountCalculationUtil.addNumberValues(taxAmount, currentComissionTaxTotal);
                platformReport.totalSaleTaxAmount = AmountCalculationUtil.addNumberValues(taxAmount, platformReport.totalSaleTaxAmount || 0);
            } else if (payment.type === 'REFUND') {

                // Trendyol aldığı komisyonu iade ediyor, bu yüzden refundlarda komisyon iadesi de oluyor. 
                // Hepsiburada da aynı şekilde yapıyor, iade edilen ürünün komisyonunu iade ediyor.
                // TODO: Bunu düşünelim... İade durumunda komisyon iadesi olmasın diye bir ayar ekleyebiliriz, böylece isteyen platformlar iade durumunda komisyon iadesi olmasın diye ayar yapabilirler. 
                // Şu an her iki platform da iade durumunda komisyon iadesi yapıyor, bu yüzden ben de şu an öyle yapıyorum, 
                // ama ileride bunu değiştirebiliriz.
                refundComissionTotal = AmountCalculationUtil.addNumberValues(item.appComissionAmount, refundComissionTotal);
                platformReport.totalRefundAmount = AmountCalculationUtil.addNumberValues(item.appComissionAmount, platformReport.totalRefundAmount || 0);
                const taxAmount = AmountCalculationUtil.multiplyNumberValues(item.appComissionAmount, taxMax);
                refundComissionTaxTotal = AmountCalculationUtil.addNumberValues(taxAmount, refundComissionTaxTotal);
                platformReport.totalRefundTaxAmount = AmountCalculationUtil.addNumberValues(taxAmount, platformReport.totalRefundTaxAmount || 0);
            }
        }
        // paymentCount yalnızca ilgili item varsa artırılır; accountId filtresi nedeniyle hiç eşleşme olmadıysa sayacı artırma.
        if (processedItemCount > 0) {
            platformReport.paymentCount = AmountCalculationUtil.addNumberValues(platformReport.paymentCount, 1);
        }
        platformReport.netTaxAmount = AmountCalculationUtil.minusNumberValues(platformReport.totalSaleTaxAmount || 0, platformReport.totalRefundTaxAmount || 0);
        platformReport.netSaleAmount = AmountCalculationUtil.minusNumberValues(platformReport.totalSaleAmount || 0, platformReport.totalRefundAmount || 0);
        platformReport.netRevenue = AmountCalculationUtil.minusNumberValues(platformReport.netSaleAmount || 0, platformReport.netTaxAmount || 0);

        // Masrafları platform-seller raporunda göstermeyeceğim... Çünkü sadece o günün komisyonunu almak için zaten ve altta ekstra masraf kafa karıştırıcı oluyor. Ödeme kanalı hizmeti için satıcı bize fatura keserken ya da satıcıya iletirken ayarlanabilir.... 
        // const totalComission = AmountCalculationUtil.minusNumberValues(currentComissionTotal, refundComissionTotal);

        // let totalComissionExpenseReport = await this.fetchOrCreateReportExpense(platformReport.id, platformReport.query.ownerAccountId!, PLATFORM_COMISSION_TOTAL, payment.currency);
        // totalComissionExpenseReport.expenseAmount = AmountCalculationUtil.addNumberValues(totalComissionExpenseReport.expenseAmount, totalComission);
        // await this.reportExpenseRepo.save(totalComissionExpenseReport);

        // let reportTotalExpenseReport = await this.fetchOrCreateReportExpense(platformReport.id, platformReport.query.ownerAccountId!, REPORT_TOTAL, payment.currency);
        // reportTotalExpenseReport.expenseAmount = AmountCalculationUtil.addNumberValues(reportTotalExpenseReport.expenseAmount, totalComission);
        // await this.reportExpenseRepo.save(reportTotalExpenseReport);

        // netRevenueWithoutExpense ve netRevenueWithoutExpenseTaxed alanlarını güncel totalExpense ile hesapla.
        // digestPayment ile aynı mantık; platformReport için de güncellenmesi gerekiyor.
        // platformReport.totalExpense = reportTotalExpenseReport.expenseAmount;
        platformReport.netRevenueWithoutExpense = AmountCalculationUtil.minusNumberValues(platformReport.netRevenue || 0, platformReport.totalExpense || 0);
        platformReport.netRevenueWithoutExpenseTaxed = AmountCalculationUtil.minusNumberValues(platformReport.netSaleAmount || 0, platformReport.totalExpense || 0);

        await this.stampTimeAndSaveReport(platformReport, payment);

        let taxGroupReport = await this.taxGroupRepo.findOne({ where: { reportId: platformReport.id, taxPercent: percent.toString(), currency: payment.currency } });
        if (!taxGroupReport) {
            taxGroupReport = new ReportTaxGroup();
            taxGroupReport.taxGroupName = "%" + percent + " (Commission Tax)";
            taxGroupReport.taxPercent = percent.toString();
            taxGroupReport.reportId = platformReport.id;
            taxGroupReport.currency = payment.currency;
        }
        taxGroupReport.totalSaleAmount = AmountCalculationUtil.addNumberValues(taxGroupReport.totalSaleAmount, currentComissionTotal);
        taxGroupReport.totalRefundAmount = AmountCalculationUtil.addNumberValues(taxGroupReport.totalRefundAmount, refundComissionTotal);
        taxGroupReport.totalSaleTaxAmount = AmountCalculationUtil.addNumberValues(taxGroupReport.totalSaleTaxAmount, currentComissionTaxTotal);
        taxGroupReport.totalRefundTaxAmount = AmountCalculationUtil.addNumberValues(taxGroupReport.totalRefundTaxAmount, refundComissionTaxTotal);

        taxGroupReport.paymentCount = AmountCalculationUtil.addNumberValues(taxGroupReport.paymentCount, 1);
        taxGroupReport.netTaxAmount = AmountCalculationUtil.minusNumberValues(taxGroupReport.totalSaleTaxAmount || 0, taxGroupReport.totalRefundTaxAmount || 0);
        taxGroupReport.netSaleAmount = AmountCalculationUtil.minusNumberValues(taxGroupReport.totalSaleAmount || 0, taxGroupReport.totalRefundAmount || 0);
        taxGroupReport.netRevenue = AmountCalculationUtil.minusNumberValues(taxGroupReport.netSaleAmount || 0, taxGroupReport.netTaxAmount || 0);
        await this.taxGroupRepo.save(taxGroupReport);
        // taxGroupReport.totalSaleAmount = 
    }



    // ─────────────────────────────────────────────────────────────
    // Cron: checkRelations
    // ─────────────────────────────────────────────────────────────
    @Cron('0 */1 * * * *') // Her 1 dakikada bir çalışır
    async checkRelations() {
        if (this.checkingRelations) {
            this.logger.debug(`Rapor fetch işlemi devam ediyor, checkRelations atlanıyor. Inflight fetch count: ${this.reportsFetchInflight.size}`);
            return;
        }
        this.checkingRelations = true;
        try {
            // DigestionID ile birden fazla instance varsa aynı raporu işlemesinler diye kontrol yapıyorum. 
            // DigestionId'ye sahip olan raporları işleyecek instance'ı seçiyorum, diğerlerini bekletiyorum. 
            // DigestionId'li raporları işleyecek instance'ı seçerken de zaten digestionId'si olan raporları dikkate almıyorum, 
            // böylece aynı raporu birden fazla instance'ın işlemesini engelliyorum.
            const digestionId = Date.now() + '_' + randomUUID();

            // DIGESTING (zaten işlenenleri) alıyorum ve bir sonraki query'de onlara dokunmuyorum. Çünkü birden fazla instance aynı raporu işleyebilir, bu da hesaplama hatalarına neden olacak.
            const alreadyWorkingReports = (
                await this.reportPaymentRelationRepo
                    .createQueryBuilder('relation')
                    .select('relation.reportId')
                    .distinctOn(['relation.reportId'])
                    .where('relation.digestionStatus = :status', { status: 'DIGESTING' })
                    .getMany()
            ).map(r => r.reportId);

            // WAITING durumundaki raporları DIGESTING yapıyorum. 
            // Böylece aynı raporu birden fazla instance'ın işlemesini engelliyorum.
            await this.reportPaymentRelationRepo.update(
                {
                    digestionStatus: 'WAITING',
                    // Boş array olunca hata veriyor... Eğer arkada zaten çalışan yoksa hepsini dahil edebiliriz...
                    ...(alreadyWorkingReports.length > 0 ? { reportId: Not(In(alreadyWorkingReports)) } : {}),
                },
                {
                    digestionStatus: 'DIGESTING',
                    digestionId: digestionId,
                    digestionStartedAt: new Date(),
                },
            );

            const relationsWaiting = await this.reportPaymentRelationRepo.find({
                where: { digestionId, digestionStatus: 'DIGESTING' },
                loadEagerRelations: true,
            });
            if (relationsWaiting.length === 0) return;

            const platforms = new Map<string, ExternalPlatform>();
            for (const relation of relationsWaiting) {
                const payment = await this.paymentCommonService.findPaymentById(relation.paymentId, true) as PaymentFullDTO;
                const freshReport = await this.reportRepo.findOne({ where: { id: relation.reportId }, relations: ['query'] });
                if (!freshReport) {
                    this.logger.warn(`Report ${relation.reportId} bulunamadı, atlanıyor`);
                    continue;
                }
                const accountId = freshReport.query?.ownerAccountId;
                if (!accountId) {
                    this.logger.warn(`Report ${freshReport.id} has no query ownerAccountId, skipping digestion`);
                    continue;
                }
                const flag = payment.includeInReportDigestion;
                if (flag && freshReport.reportType === "SELLER") {
                    const platform = await this.resolveReportPlatform(payment, platforms);
                    await this.updateExpensesForReport(freshReport.id, payment, accountId, accountId, platforms);
                    await this.updateProviderFeeExpenseForReportAccountId(freshReport.id, payment, accountId);
                    await this.digestPayment(freshReport, payment);
                    await this.updateTaxGroupReportByPaymentAndAccountId(freshReport.id, payment, accountId);
                    await this.updatePaymentItemReport(freshReport.id, payment, accountId);
                    await this.updatePlatformReport(freshReport.id, payment, platform, accountId);
                }
                if (flag && !payment.externalPlatformId && freshReport.reportType === "PLATFORM") {
                    await this.updateProviderFeeExpenseForPlatformReport(freshReport.id, payment);
                    await this.updateRefundRoundingExpense(freshReport, payment);

                }
                if (flag && (freshReport.reportType === "PLATFORM" || freshReport.reportType === "PLATFORM_SELLER")) {

                    await this.digestComissionIncomeForReport(freshReport,
                        payment,
                        freshReport.reportType === "PLATFORM_SELLER" ? accountId : undefined);

                }

                if (flag && freshReport.reportType === "PLATFORM_FLOW") {
                    const platform = await this.resolveReportPlatform(payment, platforms);
                    await this.updateExpensesForReport(freshReport.id, payment, accountId, null, platforms);
                    await this.updateProviderFeeExpenseForPlatformReport(freshReport.id, payment);
                    await this.updateRefundRoundingExpense(freshReport, payment);
                    await this.digestPlatformFlowReport(freshReport, payment);
                    await this.updateTaxGroupReportByPaymentAndAccountId(freshReport.id, payment, null);
                    await this.updatePaymentItemReport(freshReport.id, payment);
                    await this.updatePlatformReport(freshReport.id, payment, platform);

                }

                relation.digestionStatus = 'COMPLETED';
                relation.digestionId = '';
                relation.digestionCompletedAt = new Date();
                await this.reportPaymentRelationRepo.save(relation);
            }
        }
        catch (err) {
            this.logger.error(`Rapor ilişkileri kontrol edilirken hata oluştu: ${err instanceof Error ? err.stack : JSON.stringify(err)}`);
        }
        finally {
            this.checkingRelations = false;
        }
    }

    // ─────────────────────────────────────────────────────────────
    // Helpers
    // ─────────────────────────────────────────────────────────────

    /**
     * Finds all ReportQueries whose filter criteria match this payment.
     */
    private async findMatchingQueries(payment: PaymentFullDTO): Promise<ReportQuery[]> {
        const existingQueries = await this.queryRepo.find({
            where: { currency: payment.currency, reportType: In(['PLATFORM', 'PLATFORM_FLOW']) },
        });
        const accountIds = [...new Set(payment.items.map(item => item.sellerAccountId))].sort();
        for (const accountId of accountIds) {
            if (!accountId) throw new Error(`Payment ${payment.id} contains an item without a seller account`);
            existingQueries.push(...await this.reportSetup.ensureDailyQueries(accountId, payment.currency));
        }
        return existingQueries;
    }

    buildPeriodLabel(grouping: ReportDateGrouping, date: Date): string {
        const y = date.getFullYear();
        const m = String(date.getMonth() + 1).padStart(2, '0');
        const d = String(date.getDate()).padStart(2, '0');

        switch (grouping) {
            case 'DAILY':
                return `${y}-${m}-${d}`;
            case 'WEEKLY': {
                const week = this.isoWeekNumber(date);
                return `${y}-W${String(week).padStart(2, '0')}`;
            }
            case 'MONTHLY':
                return `${y}-${m}`;
            case 'YEARLY':
                return `${y}`;
            case 'ALL':
            default:
                return 'ALL';
        }
    }

    /** ISO 8601 week number */
    private isoWeekNumber(date: Date): number {
        const tmp = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()));
        tmp.setUTCDate(tmp.getUTCDate() + 4 - (tmp.getUTCDay() || 7));
        const yearStart = new Date(Date.UTC(tmp.getUTCFullYear(), 0, 1));
        return Math.ceil(((tmp.getTime() - yearStart.getTime()) / 86400000 + 1) / 7);
    }
}
