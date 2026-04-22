import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { In, Not, Repository } from 'typeorm';
import { Report } from '../entity/report.entity';
import { ReportQuery } from '../entity/report-query.entity';
import { BaseReport, ITEM_CLASS_COMISSION_PREFIX, PaymentFullDTO, PLATFORM_COMISSION_TOTAL, PAYMENT_SERVICE_FEE, REPORT_TOTAL, ReportDateGrouping } from '@tk-postral/payment-common';
import { ReportComission, ReportTaxGroup } from '../entity';
import { PaymentChannelOperation } from '../entity/payment-channel-operation.entity';
import { AmountCalculationUtil } from '../util/calcs/amount-calculations';
import { ReportPaymentRelation } from '../entity/report-payment-relation.entity';
import { PaymentCommonService } from './payment-common.service';
import { Cron } from '@nestjs/schedule';
import { randomUUID } from 'crypto';
import { AppComissionService } from './app-commission.service';
import { SellerPaymentOrderSearchService } from './transaction-search.service';
import { ReportExpense } from '../entity/report-expense.entity';
import { PaymentItemDto } from '@tk-postral/payment-common';

@Injectable()
export class ReportDigestionService {

    private readonly logger = new Logger(ReportDigestionService.name);

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
        private readonly comissionService: AppComissionService,
        private readonly paymentCommonService: PaymentCommonService,
        private readonly sellerPaymentOrderService: SellerPaymentOrderSearchService,
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
        const where = { queryId: query.id, periodLabel, currency, archived: false };
        const existing = await this.reportRepo.findOne({ where });
        if (existing) return existing;
        if (query.ownerAccountId == null) {
            throw new Error(`Query ${query.id} has no ownerAccountId, cannot create report`);
        }
        try {
            const reportNew = new Report();
            reportNew.queryId = query.id;
            reportNew.periodLabel = periodLabel;
            reportNew.currency = currency;
            reportNew.accountId = query.ownerAccountId!;
            return await this.reportRepo.save(reportNew);
        } catch (err: any) {
            throw err;
        }
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
    async insertPaymentToReportDigestionQueue(payment: PaymentFullDTO): Promise<void> {
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
        report.lastDigestedAt = new Date();
        report.lastDigestedPaymentId = payment.id;
        return await this.reportRepo.save(report);
    }

    private async reportCalculation(report: BaseReport, payment: PaymentFullDTO, accountId: string) {
        const paymentItems = payment.items.filter(i => i.sellerAccountId === accountId);
        return await this.reportCalculationByPaymentItems(report, payment.type, paymentItems, accountId);
    }

    private async reportCalculationByPaymentItems(report: BaseReport, paymentType: string, paymentItems: PaymentItemDto[], accountId: string) {

        for (const item of paymentItems) {
            if (item.sellerAccountId !== accountId) continue;
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
        if (expenseKey === PLATFORM_COMISSION_TOTAL || expenseKey === PAYMENT_SERVICE_FEE) return 2;
        return 3; // ITEM_CLASS_COMISSION_* ve diğerleri
    }

    private async fetchOrCreateReportExpense(reportId: string, accountId: string, expenseKey: string, currency: string): Promise<ReportExpense> {
        let expense = await this.reportExpenseRepo.findOne({ where: { reportId, accountId, expenseKey } });
        if (!expense) {
            expense = new ReportExpense();
            expense.reportId = reportId;
            expense.accountId = accountId;
            expense.expenseKey = expenseKey;
            expense.expenseAmount = 0;
            expense.displayWeight = ReportDigestionService.expenseDisplayWeight(expenseKey);
            await this.reportExpenseRepo.save(expense);
        }
        return expense;
    }

    private async updateProviderFeeExpenseForReport(reportId: string, payment: PaymentFullDTO, accountId: string): Promise<void> {
        const [operations, paymentSellerOrder] = await Promise.all([
            this.paymentChannelOperationRepo.find({
                where: { paymentId: payment.id, providerFeeDebitFrom: Not('PLATFORM'), providerFee: Not(0) },
            }),
            this.sellerPaymentOrderService.findByPaymentIdAndAccountId(payment.id, accountId),
        ]);



        for (const operation of operations) {

            const sellerItemsTotal = paymentSellerOrder.amount;

            if (sellerItemsTotal <= 0 || payment.totalAmount <= 0) continue;

            const ratio = AmountCalculationUtil.divideNumberValues(sellerItemsTotal, payment.totalAmount);
            const sellerFee = AmountCalculationUtil.multiplyNumberValues(operation.providerFee, ratio);

            if (sellerFee <= 0) continue;

            const feeExpense = await this.fetchOrCreateReportExpense(reportId, accountId, PAYMENT_SERVICE_FEE, payment.currency);
            feeExpense.expenseAmount = AmountCalculationUtil.addNumberValues(feeExpense.expenseAmount, sellerFee);
            await this.reportExpenseRepo.save(feeExpense);

            const totalExpense = await this.fetchOrCreateReportExpense(reportId, accountId, REPORT_TOTAL, payment.currency);
            totalExpense.expenseAmount = AmountCalculationUtil.addNumberValues(totalExpense.expenseAmount, sellerFee);
            await this.reportExpenseRepo.save(totalExpense);
        }
    }

    private async updateExpensesForReport(mainReportId: string, payment: PaymentFullDTO, accountId: string) {
        // Eğer birden fazla instance bir rapora işleseydi, bu yapı daha doğru olurdu. Ancak tek bir rapor tek bir instance işleyeceği için burada expense'leri bir 
        // anda çekip güncelleyebilirim, böylece performans artışı sağlanır. 
        // Eğer birden fazla instance aynı raporu işleyebilseydi, her expense güncellemesi için fetchOrCreate yapmak zorunda kalırdım, bu da performansı ciddi şekilde düşürürdü.

        const allExpenses = await this.reportExpenseRepo.find({
            where: { reportId: mainReportId, accountId },
        });
        const expenseMap = new Map(allExpenses.map(e => [e.expenseKey, e]));
        for (let index = 0; index < payment.items.length; index++) {
            const item = payment.items[index];
            if (item.sellerAccountId !== accountId) continue;

            if (item.itemClass) {
                const expenseKey = ITEM_CLASS_COMISSION_PREFIX + item.itemClass;
                let itemClassExpenseReport = expenseMap.get(expenseKey);
                if (!itemClassExpenseReport) {
                    itemClassExpenseReport = ReportExpense.create(mainReportId, accountId, expenseKey, 0, item.itemClass, true, ReportDigestionService.expenseDisplayWeight(expenseKey));
                    expenseMap.set(expenseKey, itemClassExpenseReport);
                }
                itemClassExpenseReport.expenseAmount = AmountCalculationUtil.addNumberValues(itemClassExpenseReport.expenseAmount, item.appComissionAmount);
                
                // await this.reportExpenseRepo.save(itemClassExpenseReport);
            }

            const totalComissionExpenseKey = PLATFORM_COMISSION_TOTAL;
            let totalComissionExpenseReport = expenseMap.get(totalComissionExpenseKey);
            if (!totalComissionExpenseReport) {
                totalComissionExpenseReport = ReportExpense.create(mainReportId, accountId, totalComissionExpenseKey, 0, undefined, true, ReportDigestionService.expenseDisplayWeight(totalComissionExpenseKey));
                expenseMap.set(totalComissionExpenseKey, totalComissionExpenseReport);
            }
            totalComissionExpenseReport.expenseAmount = AmountCalculationUtil.addNumberValues(totalComissionExpenseReport.expenseAmount, item.appComissionAmount);

            const reportTotalExpenseKey = REPORT_TOTAL;
            let reportTotalExpenseReport = expenseMap.get(reportTotalExpenseKey);
            if (!reportTotalExpenseReport) {
                reportTotalExpenseReport = ReportExpense.create(mainReportId, accountId, reportTotalExpenseKey, 0, undefined, true, ReportDigestionService.expenseDisplayWeight(reportTotalExpenseKey));
                expenseMap.set(reportTotalExpenseKey, reportTotalExpenseReport);
            }

            reportTotalExpenseReport.expenseAmount = AmountCalculationUtil.addNumberValues(reportTotalExpenseReport.expenseAmount, item.appComissionAmount);
            // await this.reportExpenseRepo.save(reportTotalExpenseReport);
        }

        await this.reportExpenseRepo.save(Array.from(expenseMap.values()));

        return;
        // Eğer hesaplamalarda hata olursa bunu tekrar açabilirim, ama şimdilik return altında kalsın
        for (let index = 0; index < payment.items.length; index++) {
            const item = payment.items[index];
            if (item.sellerAccountId !== accountId) continue;


            if (item.itemClass) {
                const expenseKey = ITEM_CLASS_COMISSION_PREFIX + item.itemClass;
                const itemClassExpenseReport = await this.fetchOrCreateReportExpense(mainReportId, accountId, expenseKey, payment.currency);
                itemClassExpenseReport.expenseAmount = AmountCalculationUtil.addNumberValues(itemClassExpenseReport.expenseAmount, item.appComissionAmount);
                await this.reportExpenseRepo.save(itemClassExpenseReport);
            }

            const totalComissionExpenseKey = PLATFORM_COMISSION_TOTAL;
            const totalComissionExpenseReport = await this.fetchOrCreateReportExpense(mainReportId, accountId, totalComissionExpenseKey, payment.currency);
            totalComissionExpenseReport.expenseAmount = AmountCalculationUtil.addNumberValues(totalComissionExpenseReport.expenseAmount, item.appComissionAmount);
            await this.reportExpenseRepo.save(totalComissionExpenseReport);

            const reportTotalExpenseKey = REPORT_TOTAL;
            const reportTotalExpenseReport = await this.fetchOrCreateReportExpense(mainReportId, accountId, reportTotalExpenseKey, payment.currency);
            reportTotalExpenseReport.expenseAmount = AmountCalculationUtil.addNumberValues(reportTotalExpenseReport.expenseAmount, item.appComissionAmount);
            await this.reportExpenseRepo.save(reportTotalExpenseReport);
        }
    }

    private async updateTaxGroupReportByPaymentAndAccountId(mainReportId: string, payment: PaymentFullDTO, accountId: string) {
        const paymentItemsPerTaxGroup: { [taxGroup: string]: PaymentItemDto[] } = {};
        for (let index = 0; index < payment.items.length; index++) {
            // Payment itemleri dolaşarak tax percentleri almam gerekiyor çünkü paymentta diğer satıcılarla ilgili bilgi olabilir...
            const item = payment.items[index];
            if (item.sellerAccountId !== accountId) continue;

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


    // ─────────────────────────────────────────────────────────────
    // Cron: checkRelations
    // ─────────────────────────────────────────────────────────────
    @Cron('0 */1 * * * *') // Development için 10 saniyede bir, production'da 1 dakikaya çekilebilir
    async checkRelations() {
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
                reportId: Not(In(alreadyWorkingReports)),
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
            // await this.updateExpensesForReport(freshReport.id, payment, accountId);
            // const totalExpense = await this.fetchOrCreateReportExpense(freshReport.id, accountId, REPORT_TOTAL, payment.currency);
            await this.updateExpensesForReport(freshReport.id, payment, accountId);
            await this.updateProviderFeeExpenseForReport(freshReport.id, payment, accountId);
            await this.digestPayment(freshReport, payment);
            await this.updateTaxGroupReportByPaymentAndAccountId(freshReport.id, payment, accountId);
            relation.digestionStatus = 'COMPLETED';
            relation.digestionId = '';
            relation.digestionCompletedAt = new Date();
            await this.reportPaymentRelationRepo.save(relation);
        }
    }


    // ─────────────────────────────────────────────────────────────
    // Helpers
    // ─────────────────────────────────────────────────────────────

    /**
     * Finds all ReportQueries whose filter criteria match this payment.
     */
    private async findMatchingQueries(payment: PaymentFullDTO): Promise<ReportQuery[]> {
        const itemSellerAccountIds = payment.items?.map(i => i.sellerAccountId) ?? [];
        return await this.queryRepo.find({
            where: {
                currency: payment.currency,
                ownerAccountId: In([...itemSellerAccountIds]),
            },
        });
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
