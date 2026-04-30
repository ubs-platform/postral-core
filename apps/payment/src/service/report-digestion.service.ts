import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { In, Not, Repository } from 'typeorm';
import { Report } from '../entity/report.entity';
import { ReportQuery } from '../entity/report-query.entity';
import { BaseReport, ITEM_CLASS_COMISSION_PREFIX, PaymentFullDTO, PLATFORM_COMISSION_TOTAL, PAYMENT_SERVICE_FEE, REPORT_TOTAL, ReportDateGrouping, ReportType } from '@tk-postral/payment-common';
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
import { AdminSettingsService } from './admin-settings.service';

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
        private readonly admSettings: AdminSettingsService,
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
            reportNew.reportType = query.reportType;
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


        // TODO: Komisyon geliri, masraflar için ayrıca rapor açılacak...
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

        // Eğer payment type PURCHASE ise, masraflar artacak, REFUND ise masraflar azalacak, çünkü iade durumunda komisyon iadesi de oluyor.
        const action = payment.type === "PURCHASE" ? AmountCalculationUtil.addNumberValues : AmountCalculationUtil.minusNumberValues;


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

                itemClassExpenseReport.expenseAmount = action(itemClassExpenseReport.expenseAmount, item.appComissionAmount);

                // await this.reportExpenseRepo.save(itemClassExpenseReport);
            }

            const totalComissionExpenseKey = PLATFORM_COMISSION_TOTAL;
            let totalComissionExpenseReport = expenseMap.get(totalComissionExpenseKey);
            if (!totalComissionExpenseReport) {
                totalComissionExpenseReport = ReportExpense.create(mainReportId, accountId, totalComissionExpenseKey, 0, undefined, true, ReportDigestionService.expenseDisplayWeight(totalComissionExpenseKey));
                expenseMap.set(totalComissionExpenseKey, totalComissionExpenseReport);
            }
            totalComissionExpenseReport.expenseAmount = action(totalComissionExpenseReport.expenseAmount, item.appComissionAmount);

            const reportTotalExpenseKey = REPORT_TOTAL;
            let reportTotalExpenseReport = expenseMap.get(reportTotalExpenseKey);
            if (!reportTotalExpenseReport) {
                reportTotalExpenseReport = ReportExpense.create(mainReportId, accountId, reportTotalExpenseKey, 0, undefined, true, ReportDigestionService.expenseDisplayWeight(reportTotalExpenseKey));
                expenseMap.set(reportTotalExpenseKey, reportTotalExpenseReport);
            }

            reportTotalExpenseReport.expenseAmount = action(reportTotalExpenseReport.expenseAmount, item.appComissionAmount);
            // await this.reportExpenseRepo.save(reportTotalExpenseReport);
        }

        await this.reportExpenseRepo.save(Array.from(expenseMap.values()));

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

    /**
     * 
     * @param platformReport 
     * @param payment 
     * @param accountId Eğer account id varsa filtrelenir, yoksa filtrelenmez. Bu da 
     * @returns 
     */
    async digestComissionIncomeForReport(platformReport: Report, payment: PaymentFullDTO, accountId?: string) {
        const adminSettings = await this.admSettings.getAdminSettings();

        if (platformReport.query == null) {
            this.logger.warn(`Report ${platformReport.id} has no query loaded, cannot digest commission`);
            return;
        }
        let totalComission = 0;
        const percent = adminSettings.comissionItemTax?.variations?.[0]?.taxRate || 0;
        if (percent === 0) {
            this.logger.warn("Comission Item Tax is not set in Admin Settings, defaulting to 0%");
        }
        const taxMax = AmountCalculationUtil.divideNumberValues(percent, AmountCalculationUtil.addNumberValues(percent, 100));
        let currentComissionTotal = 0, currentComissionTaxTotal = 0, refundComissionTotal = 0, refundComissionTaxTotal = 0;
        for (const item of payment.items) {
            // Eğer accountId varsa, sadece o satıcının ürünleri üzerinden komisyon hesaplanır, 
            // yoksa tüm ürünler üzerinden hesaplanır. Çünkü platform raporlarında tüm ürünlerin komisyonunu göstermek 
            // isteyebilirim, seller raporlarında ise sadece ilgili satıcının komisyonunu göstermek isteyebilirim.
            if (accountId && item.sellerAccountId !== accountId) continue;

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
        platformReport.paymentCount = AmountCalculationUtil.addNumberValues(platformReport.paymentCount, 1);
        platformReport.netTaxAmount = AmountCalculationUtil.minusNumberValues(platformReport.totalSaleTaxAmount || 0, platformReport.totalRefundTaxAmount || 0);
        platformReport.netSaleAmount = AmountCalculationUtil.minusNumberValues(platformReport.totalSaleAmount || 0, platformReport.totalRefundAmount || 0);
        platformReport.netRevenue = AmountCalculationUtil.minusNumberValues(platformReport.netSaleAmount || 0, platformReport.netTaxAmount || 0);
        let totalComissionExpenseReport = await this.fetchOrCreateReportExpense(platformReport.id, platformReport.query.ownerAccountId!, PLATFORM_COMISSION_TOTAL, payment.currency);
        totalComissionExpenseReport.expenseAmount = AmountCalculationUtil.addNumberValues(totalComissionExpenseReport.expenseAmount, totalComission);
        await this.reportExpenseRepo.save(totalComissionExpenseReport);

        let reportTotalExpenseReport = await this.fetchOrCreateReportExpense(platformReport.id, platformReport.query.ownerAccountId!, REPORT_TOTAL, payment.currency);
        reportTotalExpenseReport.expenseAmount = AmountCalculationUtil.addNumberValues(reportTotalExpenseReport.expenseAmount, totalComission);
        await this.reportExpenseRepo.save(reportTotalExpenseReport);
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
            let flag = payment.includeInReportDigestion
            if (flag && freshReport.reportType === "SELLER") {
                await this.updateExpensesForReport(freshReport.id, payment, accountId);
                await this.updateProviderFeeExpenseForReport(freshReport.id, payment, accountId);
                await this.digestPayment(freshReport, payment);
                await this.updateTaxGroupReportByPaymentAndAccountId(freshReport.id, payment, accountId);
            }

            if (flag && (freshReport.reportType === "PLATFORM" || freshReport.reportType === "PLATFORM_SELLER")) {
                await this.digestComissionIncomeForReport(freshReport,
                    payment,
                    freshReport.reportType === "PLATFORM_SELLER" ? accountId : undefined);

            }

            if (flag && freshReport.reportType === "PLATFORM_FLOW") {
                // TODO: Platform flow raporları için digestion işlemi yapılacak, şu an sadece seller raporları var.
                // Tüm satıcılardan gelen para akışlarını burada görüntülenecek
            }

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
        // Eğer PLATFORM_SELLER - Günlük yoksa yeni query oluşturulacak...


        const existingQueries = await this.queryRepo.find({
            where: [
                // Satıcının kendisi ile ilgili raporları çekmek istediğim için ownerAccountId'ye göre de filtreleme yapıyorum. Çünkü bir payment içinde farklı satıcıların ürünleri olabilir, bu yüzden payment ile ilişkili tüm raporları çekmek istiyorum, ancak seller raporlarında sadece ilgili satıcının raporlarıyla eşleşsin istiyorum, diğer raporlarda ise tüm payment ile eşleşsin istiyorum.
                {
                    currency: payment.currency,
                    ownerAccountId: In([...itemSellerAccountIds]),
                    reportType: 'SELLER',
                },
                // Platformun komisyondan geliri ve ödeme hizmeti sağlayıcı ücretinden gelen giderleri raporlamak istediğim için PLATFORM ve PLATFORM_FLOW raporları da payment ile eşleşiyor olacak. PLATFORM raporunda sadece toplam komisyon gelirini ve ödeme hizmeti sağlayıcı ücretlerini göstermek istiyorum, PLATFORM_FLOW raporunda ise her bir ödeme için ayrı ayrı komisyon gelirlerini ve ödeme hizmeti sağlayıcı ücretlerini göstermek istiyorum.
                {
                    currency: payment.currency,
                    reportType: In(['PLATFORM', "PLATFORM_SELLER", "PLATFORM_FLOW"]),
                },

            ],
        });

        const paymentSellerAccounts = new Set(payment.items.map(i => ({ id: i.sellerAccountId, name: i.sellerAccountName })));
        const batchInsert: Partial<ReportQuery>[] = [];
        for (let i = 0; i < paymentSellerAccounts.size; i++) {
            const accountId = Array.from(paymentSellerAccounts)[i];
            const existDailyPlatformSellerQuery = existingQueries.find(q => q.dateGrouping === 'DAILY' && q.reportType === 'PLATFORM_SELLER' && q.ownerAccountId === accountId.id),
                existDailySellerQuery = existingQueries.find(q => q.dateGrouping === 'DAILY' && q.reportType === 'SELLER' && q.ownerAccountId === accountId.id);

            if (!existDailyPlatformSellerQuery) {
                const newQuery = new ReportQuery();
                const accountName = accountId.name
                newQuery.ownerAccountId = accountId.id;
                newQuery.dateGrouping = 'DAILY';
                newQuery.reportType = 'PLATFORM_SELLER';
                newQuery.currency = payment.currency;
                newQuery.name = `Platform Seller Report / ${accountName} / ${payment.currency} / DAILY`;
                newQuery.description = "Bu rapor, satıcıların platformdan elde ettiği komisyon gelirlerini ve ödeme hizmeti sağlayıcı ücretlerini günlük olarak gösterir. Her gün için ayrı bir rapor oluşturulur ve sadece ilgili satıcının verilerini içerir.";
                batchInsert.push(newQuery);
            }

            if (!existDailySellerQuery) {
                const newQuery = new ReportQuery();
                const accountName = accountId.name
                newQuery.ownerAccountId = accountId.id;
                newQuery.dateGrouping = 'DAILY';
                newQuery.reportType = 'SELLER';
                newQuery.currency = payment.currency;
                newQuery.name = `Seller Report / ${accountName} / ${payment.currency} / DAILY`;
                newQuery.description = "Bu rapor, satıcıların satış performansını günlük olarak gösterir. Her gün için ayrı bir rapor oluşturulur ve sadece ilgili satıcının verilerini içerir. Satıcının Platforma hakedişi için yapılacak faturalandırma için kullanılacaktır.";
                batchInsert.push(newQuery);
            }
        }

        if (batchInsert.length > 0) {
            const newlySaved = await this.queryRepo.save(batchInsert);
            existingQueries.push(...newlySaved);
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
