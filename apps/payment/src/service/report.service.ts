import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Report } from '../entity/report.entity';
import { ReportQuery } from '../entity/report-query.entity';
import { ReportDTO } from '@tk-postral/payment-common';
import { ReportDateGrouping } from '@tk-postral/payment-common';
import { PaymentFullDTO } from '@tk-postral/payment-common';
import { ReportTaxGroup } from '../entity';
import { ItemCalculationUtil } from '../util/calcs/item-calculations';
import { TaxCalculationUtil } from '../util/calcs/tax-calculations';

@Injectable()
export class ReportService {
    private readonly logger = new Logger(ReportService.name);

    constructor(
        @InjectRepository(Report)
        private readonly reportRepo: Repository<Report>,
        @InjectRepository(ReportQuery)
        private readonly queryRepo: Repository<ReportQuery>,
        @InjectRepository(ReportTaxGroup)
        private readonly taxGroupRepo: Repository<ReportTaxGroup>,
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
        const existing = await this.reportRepo.findOne({
            where: { queryId: query.id, periodLabel, currency },
        });
        if (existing) return existing;

        try {
            const created = this.reportRepo.create({
                queryId: query.id,
                periodLabel,
                currency,
                totalRevenue: 0,
                totalExpense: 0,
                netIncome: 0,
                paymentCount: 0,
            });
            return await this.reportRepo.save(created);
        } catch (err: any) {
            // ER_DUP_ENTRY from MariaDB – another request already created it
            if (err?.code === 'ER_DUP_ENTRY' || err?.errno === 1062) {
                return this.reportRepo.findOne({
                    where: { queryId: query.id, periodLabel, currency },
                }) as Promise<Report>;
            }
            throw err;
        }
    }

    // ─────────────────────────────────────────────────────────────
    // digestPaymentToReport
    //
    // Called after a payment reaches COMPLETED status.
    // 1. Loads all ReportQueries that match the payment.
    // 2. For each matching query, resolves the period label.
    // 3. findOrCreate the Report bucket.
    // 4. Atomically increments the aggregated fields.
    // ─────────────────────────────────────────────────────────────
    async digestPaymentToReport(payment: PaymentFullDTO): Promise<void> {
        const queries = await this.findMatchingQueries(payment);
        if (queries.length === 0) return;

        for (const query of queries) {
            const periodLabel = this.buildPeriodLabel(
                query.dateGrouping,
                new Date(payment.createdAt as string),
            );
            const report = await this.findOrCreateByQuery(
                query,
                periodLabel,
                payment.currency,
            );
            // Mikro işlem yapmak çok daha iyi ama fazla hesaplarda bunu sürdürebilir miyim bilmiyorum. Race condition sorunları için farklı bir şey düşüneceğim ama mutlaka.

            report.paymentCount += 1;
            if (payment.type === 'PURCHASE') {
                report.totalSaleAmount = ItemCalculationUtil.addNumberValues(payment.totalAmount, report.totalSaleAmount);
                report.totalSaleTaxAmount = ItemCalculationUtil.addNumberValues(payment.taxAmount, report.totalSaleTaxAmount);
            } else if (payment.type === 'REFUND') {
                report.totalRefundAmount = ItemCalculationUtil.addNumberValues(payment.totalAmount, report.totalRefundAmount);
                report.totalRefundTaxAmount = ItemCalculationUtil.addNumberValues(payment.taxAmount, report.totalRefundTaxAmount);
            }

            report.netTaxAmount = ItemCalculationUtil.minusNumberValues(report.totalSaleTaxAmount, report.totalRefundTaxAmount);
            report.netSaleAmount = ItemCalculationUtil.minusNumberValues(report.totalSaleAmount, report.totalRefundAmount);
            report.netRevenue = ItemCalculationUtil.minusNumberValues(report.netSaleAmount, report.netTaxAmount);
            report.lastDigestedAt = new Date();
            await this.reportRepo.save(report);
            
            // // Derive deltas based on query type and payment type
            // const isPurchase = payment.type === 'PURCHASE';
            // const isRefund = payment.type === 'REFUND';

            // let revenueDelta = 0;
            // let expenseDelta = 0;

            // if (isPurchase) revenueDelta = payment.totalAmount;
            // if (isRefund) expenseDelta = payment.totalAmount;

            // if (revenueDelta === 0 && expenseDelta === 0) continue;

            // // Atomic increments – no lost-update risk
            // if (revenueDelta !== 0) {
            //     await this.reportRepo.increment({ id: report.id }, 'totalRevenue', revenueDelta);
            // }
            // if (expenseDelta !== 0) {
            //     await this.reportRepo.increment({ id: report.id }, 'totalExpense', expenseDelta);
            // }
            // // netIncome = totalRevenue - totalExpense  →  delta = revenueDelta - expenseDelta
            // const netDelta = revenueDelta - expenseDelta;
            // if (netDelta !== 0) {
            //     await this.reportRepo.increment({ id: report.id }, 'netIncome', netDelta);
            // }
            // await this.reportRepo.increment({ id: report.id }, 'paymentCount', 1);
            // await this.reportRepo.update({ id: report.id }, { lastDigestedAt: new Date() });
            // await this.updateTaxGroupReportByPayment(payment, report);

            this.logger.debug(
                `Digested payment ${payment.id} into report ${report.id} (query: ${query.name}, period: ${periodLabel})`,
            );
        }
    }

    private async updateTaxGroupReportByPayment(payment: PaymentFullDTO, report: Report) {
        for (let index = 0; index < payment.taxes.length; index++) {
            const taxGroup = payment.taxes[index];
            const where = { reportId: report.id, taxPercent: taxGroup.percent.toString(), currency: payment.currency };
            const existingTaxGroupReport = await this.taxGroupRepo.findOne({ where });
            let deltaIncomeFull = 0, deltaExpenseFull = 0;
            if (payment.type === 'PURCHASE') {
                deltaIncomeFull = taxGroup.taxAmount;
            } else if (payment.type === 'REFUND') {
                deltaExpenseFull = taxGroup.taxAmount;
            }
            if (existingTaxGroupReport) {
                // TODO: Yeni tax group raporu oluşturulacak ve kaydedilecek
                continue;
            }
            await this.taxGroupRepo.increment(
                where,
                'totalTaxAmount',
                taxGroup.taxAmount
            );

        }
    }

    async findByQueryId(queryId: string): Promise<ReportDTO[]> {
        const reports = await this.reportRepo.find({
            where: { queryId },
            order: { periodLabel: 'DESC' },
        });
        return reports.map((r) => this.toDto(r));
    }

    // ─────────────────────────────────────────────────────────────
    // Helpers
    // ─────────────────────────────────────────────────────────────

    /**
     * Finds all ReportQueries whose filter criteria match this payment.
     */
    private async findMatchingQueries(payment: PaymentFullDTO): Promise<ReportQuery[]> {
        const all = await this.queryRepo.find();

        return all.filter((query) => {
            // Currency filter
            if (query.currency && query.currency !== payment.currency) return false;

            // Payment type filter by report type
            // if (query.type === 'REVENUE' && payment.type !== 'PURCHASE') return false;
            // if (query.type === 'EXPENSE' && payment.type !== 'REFUND') return false;

            // Owner account filter – matches customer OR any seller in items
            if (query.ownerAccountId) {
                const isCustomer = payment.customerAccountId === query.ownerAccountId;
                const isSeller = payment.items?.some(
                    (item) => item.sellerAccountId === query.ownerAccountId,
                );
                if (!isCustomer && !isSeller) return false;
            }

            return true;
        });
    }

    private buildPeriodLabel(grouping: ReportDateGrouping, date: Date): string {
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

    toDto(entity: Report): ReportDTO {
        const dto = new ReportDTO();
        dto.id = entity.id;
        dto.queryId = entity.queryId;
        dto.periodLabel = entity.periodLabel;
        dto.currency = entity.currency;
        dto.totalRevenue = entity.totalRevenue;
        dto.totalExpense = entity.totalExpense;
        dto.netIncome = entity.netIncome;
        dto.paymentCount = entity.paymentCount;
        dto.lastDigestedAt = entity.lastDigestedAt;
        dto.createdAt = entity.createdAt;
        return dto;
    }
}
