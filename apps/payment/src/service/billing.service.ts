import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { In, Repository } from 'typeorm';
import { Cron } from '@nestjs/schedule';
import { Report, ReportQuery } from '@tk-postral/postral-entities';
import { AdminSettingsService } from './admin-settings.service';
import { AdminSettingsDto } from '@tk-postral/payment-common';
import { AmountCalculationUtil } from '@tk-postral/common-utils';
import { PaymentService } from './payment.service';

@Injectable()
export class BillingService {
    private readonly logger = new Logger(BillingService.name);

    constructor(
        @InjectRepository(Report)
        private readonly reportRepo: Repository<Report>,
        @InjectRepository(ReportQuery)
        private readonly queryRepo: Repository<ReportQuery>,
        private readonly adminSettingsService: AdminSettingsService,
        private readonly paymentService: PaymentService
    ) { }

    // ─────────────────────────────────────────────────────────────
    // Cron: her gün 00:05'te çalışır, bugün fatura günüyse işleme başlar
    // ─────────────────────────────────────────────────────────────
    @Cron('0 5 0 * * *')
    async dailyBillingCheck() {
        const settings = await this.adminSettingsService.getAdminSettings();
        if (!settings.billingDays?.length || !settings.billingAccountId) {
            return;
        }
        const todayDayOfMonth = new Date().getDate();
        if (!settings.billingDays.includes(todayDayOfMonth)) {
            return;
        }
        this.logger.log(`Billing day detected (day ${todayDayOfMonth}). Starting billing run...`);
        await this.runBilling(settings);
    }

    // ─────────────────────────────────────────────────────────────
    // runBilling — admin panelinden veya cron'dan tetiklenebilir
    // ─────────────────────────────────────────────────────────────
    async runBilling(settings?: AdminSettingsDto, onMissingConfig: "THROW" | "SKIP" = "SKIP") {
        const resolvedSettings = settings ?? await this.adminSettingsService.getAdminSettings();
        if (!resolvedSettings.billingAccountId) {
            if (onMissingConfig === "THROW") {
                throw new Error('runBilling: billingAccountId is not configured. Cannot proceed.');
            }
            this.logger.warn('runBilling: billingAccountId is not configured. Skipping.');
            return;
        }

        // DAILY sorguları olan tüm satıcıları bul (SELLER veya PLATFORM_SELLER sorgusu olan)
        const sellerRows = await this.queryRepo
            .createQueryBuilder('rq')
            .select('DISTINCT rq.ownerAccountId', 'ownerAccountId')
            .where("rq.dateGrouping = 'DAILY'")
            .andWhere("rq.reportType IN ('SELLER', 'PLATFORM_SELLER')")
            .andWhere('rq.ownerAccountId IS NOT NULL')
            .getRawMany<{ ownerAccountId: string }>();

        if (sellerRows.length === 0) {
            this.logger.log('runBilling: No sellers found with DAILY queries.');
            return;
        }

        for (const { ownerAccountId } of sellerRows) {
            const currencies = await this.getDistinctUnbilledCurrencies(ownerAccountId);
            for (const currency of currencies) {
                await this.createCommissionBillingForSeller(ownerAccountId, currency, resolvedSettings);
                await this.createEarningsBillingForSeller(ownerAccountId, currency, resolvedSettings);
            }
        }

        this.logger.log(`runBilling: Completed for ${sellerRows.length} seller(s).`);
    }

    // ─────────────────────────────────────────────────────────────
    // Komisyon faturası: Satıcı → Platform'a öder
    // Günlük PLATFORM_SELLER raporlarındaki netSaleAmount toplanır.
    // Vergi'yi yine platform ödeyeceği için netRevenue kullanılmaz.
    // Vergi oranı admin settings'ten alınır, faturaya tek bir item olarak eklenir.
    // ─────────────────────────────────────────────────────────────
    private async createCommissionBillingForSeller(
        sellerAccountId: string,
        currency: string,
        settings: AdminSettingsDto,
    ) {
        const reports = await this.findUnbilledReports('PLATFORM_SELLER', sellerAccountId, currency);
        if (reports.length === 0) return;

        const totalCommission = reports.reduce(
            (sum, r) => AmountCalculationUtil.addNumberValues(sum, r.netSaleAmount || 0),
            0,
        );
        if (totalCommission <= 0) {
            this.logger.log(`Commission billing skipped for seller ${sellerAccountId} (${currency}): total is ${totalCommission}`);
            return;
        }

        const periodDesc = this.buildPeriodDesc(reports);
        const taxRate = settings.comissionItemTax?.variations?.[0]?.taxRate ?? 0;

        const payment = await this.paymentService.createBillingPayment({
            // Komisyonu satıcı öder: satıcı müşteri, platform satıcı konumunda
            customerAccountId: sellerAccountId,
            sellerAccountId: settings.billingAccountId!,
            totalAmount: totalCommission,
            currency,
            itemId: 'BILLING_COMMISSION',
            itemName: `Komisyon Faturası: ${periodDesc}`,
            taxRate,
        });

        await this.markReportsAsBilled(reports);
        this.logger.log(
            `Commission billing payment created: ${payment.id} for seller ${sellerAccountId} (${currency}), amount: ${totalCommission}, covering ${reports.length} reports`,
        );
    }

    // ─────────────────────────────────────────────────────────────
    // Hakediş faturası: Platform → Satıcıya öder
    // Günlük SELLER raporlarındaki netRevenueWithoutExpense toplanır
    // ─────────────────────────────────────────────────────────────
    private async createEarningsBillingForSeller(
        sellerAccountId: string,
        currency: string,
        settings: AdminSettingsDto,
    ) {
        const reports = await this.findUnbilledReports('SELLER', sellerAccountId, currency);
        if (reports.length === 0) return;

        const totalEarnings = reports.reduce(
            (sum, r) => AmountCalculationUtil.addNumberValues(sum, r.netRevenueWithoutExpenseTaxed || 0),
            0,
        );
        if (totalEarnings <= 0) {
            this.logger.log(`Earnings billing skipped for seller ${sellerAccountId} (${currency}): total is ${totalEarnings}`);
            return;
        }

        const periodDesc = this.buildPeriodDesc(reports);

        const payment = await this.paymentService.createBillingPayment({
            // Hakediş: platform ödüyor, satıcı alıyor
            customerAccountId: settings.billingAccountId!,
            sellerAccountId: sellerAccountId,
            totalAmount: totalEarnings,
            currency,
            itemId: 'BILLING_EARNINGS',
            itemName: `Hakediş: ${periodDesc}`,
            taxRate: 0,
        });

        await this.markReportsAsBilled(reports);
        this.logger.log(
            `Earnings billing payment created: ${payment.id} for seller ${sellerAccountId} (${currency}), amount: ${totalEarnings}, covering ${reports.length} reports`,
        );
    }



    // ─────────────────────────────────────────────────────────────
    // Helpers
    // ─────────────────────────────────────────────────────────────

    private async findUnbilledReports(
        reportType: 'SELLER' | 'PLATFORM_SELLER',
        ownerAccountId: string,
        currency: string,
    ): Promise<Report[]> {
        // Bugünün tarihi dışarıda bırakılıyor: gün henüz tamamlanmamış olabilir,
        // gece yarısına yakın satışlar digestion kuyruğunda bekliyor olabilir.
        const todayLabel = this.todayPeriodLabel();
        return await this.reportRepo
            .createQueryBuilder('r')
            .innerJoin('r.query', 'rq')
            .where('rq.ownerAccountId = :ownerAccountId', { ownerAccountId })
            .andWhere("rq.dateGrouping = 'DAILY'")
            .andWhere('rq.reportType = :reportType', { reportType })
            .andWhere('r.currency = :currency', { currency })
            .andWhere('r.billedAt IS NULL')
            .andWhere('r.archived = false')
            .andWhere('r.paymentCount > 0')
            .andWhere('r.periodLabel < :todayLabel', { todayLabel })
            .getMany();
    }

    private async getDistinctUnbilledCurrencies(ownerAccountId: string): Promise<string[]> {
        const todayLabel = this.todayPeriodLabel();
        const rows = await this.reportRepo
            .createQueryBuilder('r')
            .select('DISTINCT r.currency', 'currency')
            .innerJoin('r.query', 'rq')
            .where('rq.ownerAccountId = :ownerAccountId', { ownerAccountId })
            .andWhere("rq.dateGrouping = 'DAILY'")
            .andWhere("rq.reportType IN ('SELLER', 'PLATFORM_SELLER')")
            .andWhere('r.billedAt IS NULL')
            .andWhere('r.archived = false')
            .andWhere('r.paymentCount > 0')
            .andWhere('r.periodLabel < :todayLabel', { todayLabel })
            .getRawMany<{ currency: string }>();
        return rows.map(r => r.currency);
    }

    /** DAILY periodLabel formatı: "YYYY-MM-DD" */
    private todayPeriodLabel(): string {
        const now = new Date();
        const y = now.getFullYear();
        const m = String(now.getMonth() + 1).padStart(2, '0');
        const d = String(now.getDate()).padStart(2, '0');
        return `${y}-${m}-${d}`;
    }

    private async markReportsAsBilled(reports: Report[]): Promise<void> {
        if (reports.length === 0) return;
        await this.reportRepo.update(
            { id: In(reports.map(r => r.id)) },
            { billedAt: new Date() },
        );
    }

    private buildPeriodDesc(reports: Report[]): string {
        const labels = reports.map(r => r.periodLabel).sort();
        if (labels.length === 0) return '';
        if (labels.length === 1) return labels[0];
        return `${labels[0]} - ${labels[labels.length - 1]}`;
    }
}
