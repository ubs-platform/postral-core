import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { In, Not, Repository } from 'typeorm';
import { Report } from '../entity/report.entity';
import { ReportQuery } from '../entity/report-query.entity';
import { BaseReport, ITEM_CLASS_COMISSION_PREFIX, PaymentFullDTO, PLATFORM_COMISSION_TOTAL, REPORT_TOTAL, ReportDateGrouping } from '@tk-postral/payment-common';
import { ReportComission, ReportTaxGroup } from '../entity';
import { ItemCalculationUtil } from '../util/calcs/item-calculations';
import { RatioCalculationUtil } from '../util/calcs/ratio-calculations';
import { ReportPaymentRelation } from '../entity/report-payment-relation.entity';
import { PaymentCommonService } from './payment-common.service';
import { Cron } from '@nestjs/schedule';
import { randomUUID } from 'crypto';
import { AppComissionService } from './app-commission.service';
import { SellerPaymentOrderSearchService } from './transaction-search.service';
import { ReportExpense } from '../entity/report-expense.entity';

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
        // TODO: Payment için masrafı burada hesapla ve base report içinde sakla. 
        // Diğer masraflar için hala Report Expense kullanabiliriz. 
        // Masraf kalemlerini de ReportExpense içinde expenseKey ile ayırabiliriz,
        //  böylece yeni masraf kalemleri eklemek istediğimizde esneklik sağlamış oluruz.
        const paymentOrders = await this.sellerPaymentOrderService.findAll({
            paymentId: payment.id,
            targetAccountIds: accountId,
            admin: 'true',
        });
        const paymentOrder = paymentOrders.find(po => po.targetAccountId === accountId);
        if (!paymentOrder) {
            this.logger.warn(`No payment order found for payment ${payment.id} and account ${accountId}`);
            return;
        }
        report.paymentCount += 1;

        if (payment.type === 'PURCHASE') {
            report.totalSaleAmount = ItemCalculationUtil.addNumberValues(paymentOrder.amount, report.totalSaleAmount || 0);
            report.totalSaleTaxAmount = ItemCalculationUtil.addNumberValues(paymentOrder.taxAmount, report.totalSaleTaxAmount || 0);
        } else if (payment.type === 'REFUND') {
            report.totalRefundAmount = ItemCalculationUtil.addNumberValues(paymentOrder.amount, report.totalRefundAmount || 0);
            report.totalRefundTaxAmount = ItemCalculationUtil.addNumberValues(paymentOrder.taxAmount, report.totalRefundTaxAmount || 0);
        }
        report.netTaxAmount = ItemCalculationUtil.minusNumberValues(report.totalSaleTaxAmount || 0, report.totalRefundTaxAmount || 0);
        report.netSaleAmount = ItemCalculationUtil.minusNumberValues(report.totalSaleAmount || 0, report.totalRefundAmount || 0);
        report.netRevenue = ItemCalculationUtil.minusNumberValues(report.netSaleAmount || 0, report.netTaxAmount || 0);
    }

    private async fetchOrCreateReportExpense(reportId: string, accountId: string, expenseKey: string, currency: string): Promise<ReportExpense> {
        let expense = await this.reportExpenseRepo.findOne({ where: { reportId, accountId, expenseKey } });
        if (!expense) {
            expense = new ReportExpense();
            expense.reportId = reportId;
            expense.accountId = accountId;
            expense.expenseKey = expenseKey;
            expense.expenseAmount = 0;
            await this.reportExpenseRepo.save(expense);
        }
        return expense;
    }

    private async updateExpensesForReport(mainReportId: string, payment: PaymentFullDTO, accountId: string) {
        
        for (let index = 0; index < payment.items.length; index++) {
            const item = payment.items[index];
            if (item.sellerAccountId !== accountId) continue;

            const comission = await this.comissionService.fetchOneForCalculation(accountId, item.itemClass || '');
            const comissionRatio = comission.percent / 100;

            if (item.itemClass) {
                const expenseKey = ITEM_CLASS_COMISSION_PREFIX + item.itemClass;
                const itemClassExpenseReport = await this.fetchOrCreateReportExpense(mainReportId, accountId, expenseKey, payment.currency);
                const itemExpenseAmount = RatioCalculationUtil.multiplyTwoValues(item.totalAmount, comissionRatio);
                itemClassExpenseReport.expenseAmount = ItemCalculationUtil.addNumberValues(itemClassExpenseReport.expenseAmount, itemExpenseAmount);
                await this.reportExpenseRepo.save(itemClassExpenseReport);
            }

            const totalComissionExpenseKey = PLATFORM_COMISSION_TOTAL;
            const totalComissionExpenseReport = await this.fetchOrCreateReportExpense(mainReportId, accountId, totalComissionExpenseKey, payment.currency);
            const totalComissionAmount = RatioCalculationUtil.multiplyTwoValues(item.totalAmount, comissionRatio);
            totalComissionExpenseReport.expenseAmount = ItemCalculationUtil.addNumberValues(totalComissionExpenseReport.expenseAmount, totalComissionAmount);
            await this.reportExpenseRepo.save(totalComissionExpenseReport);

            const reportTotalExpenseKey = REPORT_TOTAL;
            const reportTotalExpenseReport = await this.fetchOrCreateReportExpense(mainReportId, accountId, reportTotalExpenseKey, payment.currency);
            reportTotalExpenseReport.expenseAmount = ItemCalculationUtil.addNumberValues(reportTotalExpenseReport.expenseAmount, totalComissionAmount);
            await this.reportExpenseRepo.save(reportTotalExpenseReport);
        }
    }

    private async updateTaxGroupReportByPaymentAndAccountId(mainReportId: string, payment: PaymentFullDTO, accountId: string) {
        for (let index = 0; index < payment.items.length; index++) {
            // Payment itemleri dolaşarak tax percentleri almam gerekiyor çünkü paymentta diğer satıcılarla ilgili bilgi olabilir...
            const item = payment.items[index];
            if (item.sellerAccountId !== accountId) continue;

            const taxGroup = item.taxPercent;
            const taxGroupLabel = taxGroup ? `Tax ${taxGroup}%` : 'No Tax';
            let taxGroupReport = await this.taxGroupRepo.findOne({ where: { reportId: mainReportId, taxGroupName: taxGroupLabel } });
            if (!taxGroupReport) {
                taxGroupReport = new ReportTaxGroup();
                taxGroupReport.reportId = mainReportId;
                taxGroupReport.taxGroupName = taxGroupLabel;
                taxGroupReport.currency = payment.currency;
                taxGroupReport.taxPercent = taxGroup.toString();
            }
            await this.reportCalculation(taxGroupReport, payment, accountId);
            await this.taxGroupRepo.save(taxGroupReport);
        }
    }


    // ─────────────────────────────────────────────────────────────
    // Cron: checkRelations
    // ─────────────────────────────────────────────────────────────
    @Cron('*/10 * * * * *') // Development için 10 saniyede bir, production'da 1 dakikaya çekilebilir
    async checkRelations() {
        const digestionId = Date.now() + '_' + randomUUID();
        const alreadyWorkingReports = (
            await this.reportPaymentRelationRepo
                .createQueryBuilder('relation')
                .select('relation.reportId')
                .distinctOn(['relation.reportId'])
                .where('relation.digestionStatus = :status', { status: 'DIGESTING' })
                .getMany()
        ).map(r => r.reportId);

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
