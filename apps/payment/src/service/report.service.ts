import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { In, Not, Repository, UpdateResult } from 'typeorm';
import { TypeormSearchUtil } from './base/typeorm-search-util';
import { Report } from '../entity/report.entity';
import { ReportQuery } from '../entity/report-query.entity';
import { BaseReport, PaymentTransactionDTO, ReportDTO, SellerPaymentOrderDTO } from '@tk-postral/payment-common';
import { ReportDateGrouping } from '@tk-postral/payment-common';
import { PaymentFullDTO } from '@tk-postral/payment-common';
import { ReportTaxGroup } from '../entity';
import { ItemCalculationUtil } from '../util/calcs/item-calculations';
import { TaxCalculationUtil } from '../util/calcs/tax-calculations';
import { ReportPaymentRelation } from '../entity/report-payment-relation.entity';
import { PaymentCommonService } from './payment-common.service';
import { Cron } from '@nestjs/schedule';
import { UUID } from 'typeorm/driver/mongodb/bson.typings';
import { SellerPaymentOrderService } from './transaction.service';
import { SellerPaymentOrderSearchService } from './transaction-search.service';
import { randomUUID } from 'crypto';
import { exec } from 'child_process';
import { ReportReconstructionDTO } from '@tk-postral/payment-common/dto';

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
        @InjectRepository(ReportPaymentRelation)
        private readonly reportPaymentRelationRepo: Repository<ReportPaymentRelation>,
        private readonly paymentCommonService: PaymentCommonService,
        private readonly sellerPaymentOrderService: SellerPaymentOrderSearchService,
        // @InjectRepository(ReportOperationStatus)
        // private readonly reportOperationStatusRepo: Repository<ReportOperationStatus>,
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
        const existing = await this.reportRepo.findOne({
            where
        });
        if (existing) return existing;

        try {
            const reportNew = new Report();
            reportNew.queryId = query.id;
            reportNew.periodLabel = periodLabel;
            reportNew.currency = currency;


            const created = await this.reportRepo.save(reportNew);
            return created;
        } catch (err: any) {
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
    async insertPaymentToReportDigestionQueue(payment: PaymentFullDTO): Promise<void> {
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
            await this.insertPaymentToReportDigestionSingle(report.id, payment.id, query.ownerAccountId!);
        }
    }

    private async insertPaymentToReportDigestionSingle(reportId: string, paymentId: string, accountId: string) {
        await this.reportPaymentRelationRepo.save({
            reportId: reportId,
            paymentId: paymentId,
            digestionStatus: "WAITING",
            accountId: accountId,
        });

        this.logger.debug(
            `Digested payment ${paymentId} into report ${reportId}`
        );
    }

    private async digestPayment(report: Report, payment: PaymentFullDTO) {
        // Taze veri: döngüde paylaşılan stale instance yerine DB'den güncel satırı çekiyoruz.
        // Aksi hâlde aynı batch'te aynı report'a ait iki relation işlenirken ikinci yazım
        // birinci yazımı ezer (last-write-wins) ve toplamlar yanlış hesaplanır.
        if (report.query == null) {
            this.logger.warn(`Report ${report.id} has no query loaded`);
            return;
        }
        const accountId = report.query.ownerAccountId;

        await this.reportCalculation(report, payment, accountId!);
        report.lastDigestedAt = new Date();
        report.lastDigestedPaymentId = payment.id;
        return await this.reportRepo.save(report);
    }

    private async reportCalculation(report: BaseReport, payment: PaymentFullDTO, accountId: string) {
        const paymentOrders = (await this.sellerPaymentOrderService.findAll({
            paymentId: payment.id,
            targetAccountIds: accountId,
            admin: 'true'
        }));
        const paymentOrder = paymentOrders.find(po => po.targetAccountId === accountId);
        if (!paymentOrder) {
            this.logger.warn(`No payment order found for payment ${payment.id} and account ${accountId}`);
            return;
        }
        report.paymentCount += 1;

        if (payment.type === 'PURCHASE') {
            report.totalSaleAmount = ItemCalculationUtil.addNumberValues(paymentOrder.amount, report.totalSaleAmount);
            report.totalSaleTaxAmount = ItemCalculationUtil.addNumberValues(paymentOrder.taxAmount, report.totalSaleTaxAmount);
        } else if (payment.type === 'REFUND') {
            report.totalRefundAmount = ItemCalculationUtil.addNumberValues(paymentOrder.amount, report.totalRefundAmount);
            report.totalRefundTaxAmount = ItemCalculationUtil.addNumberValues(paymentOrder.taxAmount, report.totalRefundTaxAmount);
        }
        report.netTaxAmount = ItemCalculationUtil.minusNumberValues(report.totalSaleTaxAmount, report.totalRefundTaxAmount);
        report.netSaleAmount = ItemCalculationUtil.minusNumberValues(report.totalSaleAmount, report.totalRefundAmount);
        report.netRevenue = ItemCalculationUtil.minusNumberValues(report.netSaleAmount, report.netTaxAmount);
    }

    private async updateTaxGroupReportByPaymentAndAccountId(mainReportId: string, payment: PaymentFullDTO, accountId: string) {
        for (let index = 0; index < payment.items.length; index++) {
            // Payment itemleri dolaşarak tax percentleri almam gerekiyor çünkü paymentta diğer satıcılarla ilgili bilgi olabilir...
            const item = payment.items[index];
            if (item.sellerAccountId !== accountId) {
                continue;
            }
            const taxGroup = item.taxPercent, taxGroupLabel = taxGroup ? `Tax ${taxGroup}%` : 'No Tax';
            let taxGroupReport = await this.taxGroupRepo.findOne({ where: { reportId: mainReportId, taxGroupName: taxGroupLabel } });
            if (!taxGroupReport) {
                taxGroupReport = new ReportTaxGroup();
                taxGroupReport.reportId = mainReportId;
                taxGroupReport.taxGroupName = taxGroupLabel;
            }

            await this.reportCalculation(taxGroupReport, payment, accountId);
            await this.taxGroupRepo.save(taxGroupReport);
        }
    }

    async findByQueryId(queryId: string): Promise<ReportDTO[]> {
        const reports = await this.reportRepo.find({
            where: { queryId },
            order: { periodLabel: 'DESC' },
        });
        return reports.map((r) => this.toDto(r));
    }

    async searchByQueryId(
        queryId: string,
        page?: number | string,
        size?: number | string,
        hideArchived?: boolean,
    ) {
        const where: any = { queryId };
        if (hideArchived) {
            where.archived = false;
        }
        return (await TypeormSearchUtil.modelSearch<Report>(
            this.reportRepo,
            size || 10,
            page || 0,
            { periodLabel: 'desc' },
            [],
            where,
        )).map((r) => this.toDto(r));
    }



    // cron olacak
    @Cron('*/10 * * * * *') // her dakika (Development için 10 saniyede bir çalışacak şekilde ayarladım, production'da bunu 1 dakikaya veya daha uzun aralıklara çekebiliriz)
    async checkRelations() {
        const digestionId = Date.now() + "_" + randomUUID();
        const alreadyWorkingReports = (await this.reportPaymentRelationRepo.createQueryBuilder("relation").select("relation.reportId").distinctOn(["relation.reportId"]).where("relation.digestionStatus = :status", { status: "DIGESTING" }).getMany()).map(r => r.reportId);
        await this.reportPaymentRelationRepo.update({
            digestionStatus: "WAITING",
            reportId: Not(In(alreadyWorkingReports)),
        }, {
            digestionStatus: "DIGESTING",
            digestionId: digestionId,
            digestionStartedAt: new Date()
        });

        const relationsWaiting = await this.reportPaymentRelationRepo.find({
            where: { digestionId: digestionId, digestionStatus: "DIGESTING" },
            loadEagerRelations: true
        });
        if (relationsWaiting.length === 0) {
            return;
        }
        for (const relation of relationsWaiting) {

            // FIX: loadEagerRelations: false ile relation.payment yüklenmez; doğrudan paymentId kolonunu kullanıyoruz.
            const payment = await this.paymentCommonService.findPaymentById(relation.paymentId, true) as PaymentFullDTO;
            // FIX: await eksikti; olmadan digestion bitmeden status COMPLETED'a çekiliyordu ve hatalar yutuluyordu.
            // Geleceğinden eminiz, ama nullsa zaten patlayalım 💥💥

            // yeni getirilsin sıkıntı olmasın
            const freshReport = await this.reportRepo.findOne({ where: { id: relation.reportId }, relations: ['query'] });
            if (!freshReport) {
                this.logger.warn(`Report ${relation.reportId} bulunamadı, atlanıyor`);
                continue;
            }
            await this.digestPayment(freshReport, payment);
            await this.updateTaxGroupReportByPaymentAndAccountId(freshReport.id, payment, freshReport.query.ownerAccountId!);
            // tamamlandıktan sonra digestionStatus'ü "COMPLETED" yapalım, böylece bu ilişki bir daha işlenmez.
            relation.digestionStatus = "COMPLETED";
            relation.digestionId = "";
            relation.digestionCompletedAt = new Date();
            await this.reportPaymentRelationRepo.save(relation);
        }
        // }
        // this.alreadyRunning = false;
    }

    // ─────────────────────────────────────────────────────────────
    // Helpers
    // ─────────────────────────────────────────────────────────────

    /**
     * Finds all ReportQueries whose filter criteria match this payment.
     * 
     * BUG: Burada bir sıkıntı var... PaymentDTO'da birden fazla sellerAccountId'si olabilir (payment.items içindeki her item'ın sellerAccountId'si farklı olabilir) 
     * ve biz bu sellerAccountId'lerin herhangi biri query.ownerAccountId'ne 
     * eşitse o query'i dahil etmek istiyoruz. O yüzden Payment yerine SellerPaymentOrder kullansak daha iyi olabilir, 
     * çünkü SellerPaymentOrder'da her item için ayrı bir satır olurdu ve sellerAccountId'yi direkt kullanabilirdik.
     *  Şimdilik payment.items içindeki sellerAccountId'leri tek tek çekip In() ile sorguluyoruz ama bu da tam doğru değil 
     * çünkü payment.items çok fazla olabilir ve sorgu sınırlarını aşabiliriz. 
     */
    private async findMatchingQueries(payment: PaymentFullDTO): Promise<ReportQuery[]> {
        const itemSellerAccountIds = payment.items?.map((i) => i.sellerAccountId) ?? [];
        return await this.queryRepo.find({
            where: {
                currency: payment.currency,
                // Müşteriyi dahil etmeyi bilemedim ama düşünülebilir... payment.customerAccountId, query.ownerAccountId'ne eşitse veya payment.items içindeki herhangi bir sellerAccountId, query.ownerAccountId'ne eşitse bu query'e dahil et. Eğer query.ownerAccountId null ise tüm ödemeler dahil olsun.
                ownerAccountId: In([...itemSellerAccountIds]),
            }
        })
        // claude sen yapma bari bunu 😭😭😭😭
        // const all = await this.queryRepo.find();
        // return all.filter((query) => {...
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

    /**
     * Herhangi bir reporta (report payment relation tablosuna) dahil olmayan paymentları accountId'ye göre relation'a WAITING statüsünde eklenir.
     * @param accountId 
     */
    async includeOlderNotIncludedPayments(accountId: string, newPeriodLabel: string, oldReportId: string, newReportId: string) {
        const oldReportArchived = await this.reportRepo.findOne({ where: { id: oldReportId }, relations: ['query'] });
        if (!oldReportArchived) {
            throw new Error(`Report ${oldReportId} not found`);
        }
        if (oldReportArchived.query == null) {
            throw new Error(`Report ${oldReportId} has no query loaded`);
        }
        const payments = await this.paymentCommonService.findPaymentDoesntHaveReportRelation(accountId, oldReportId);
        const batchInsert: Partial<ReportPaymentRelation>[] = [];
        for (const payment of payments) {
            const periodLabel = this.buildPeriodLabel(
                oldReportArchived.query.dateGrouping,
                new Date(payment.createdAt),
            );
            if (periodLabel !== newPeriodLabel) {
                // Bu payment bu rapora ait değil, atla.
                continue;
            }
            batchInsert.push({
                reportId: newReportId,
                paymentId: payment.id,
                digestionStatus: "WAITING",
            });

        }

        if (batchInsert.length > 0) {
            try {
                await this.reportPaymentRelationRepo.insert(batchInsert);

            } catch (error) {
                this.logger.error(`Failed to insert report payment relations for report reconstruction. ReportId: ${newReportId}, Error: ${error.message}`);
            }
        }
    }

    /**
     * Eski report'u farklı isimle kaydedip yeni report açacak. Sonra da tüm paymentlar tekrar waiting'e çekilecek ve digestion queue'ya girecek. Böylece eski report'taki tüm paymentlar yeni report'ta tekrar işlenecek ve rapor güncellenecek.
     * Eğer hesaplamalarda hata varsa veya yeni bir alan ekledik de eski raporlarda o alan boş kalıyorsa bu method'u çalıştırarak tüm raporları güncelleyebiliriz.
     * @param reportId 
     * @returns 
     */
    async reportReconstruct(reconstruction: ReportReconstructionDTO) {
        const { reportId, findNotExistingPaymentsForAccountId } = reconstruction;
        let oldReport = await this.reportRepo.findOne({ where: { id: reportId }, relations: ['query'] });
        if (!oldReport) {
            throw new Error(`Report ${reportId} not found`);
            // this.logger.warn(`Report ${reportId} bulunamadı, reconstruction atlanıyor`);
            // return;
        }
        if (oldReport.query == null) {
            throw new Error(`Report ${reportId} has no query loaded.`);
            // this.logger.warn(`Report ${reportId} has no query loaded, reconstruction atlanıyor`);
            // return;
        }
        if (oldReport.query.ownerAccountId == null) {
            throw new Error(`Report ${reportId} has no query ownerAccountId.`);
        }
        if (oldReport.archived) {
            throw new Error(`Report ${reportId} is already archived.`);
        }
        const currentReportLabel = oldReport.periodLabel;
        oldReport.periodLabel = oldReport.periodLabel + "_OLD_" + Date.now();
        oldReport.archived = true;
        oldReport = await this.reportRepo.save(oldReport);
        const brandNewReport = await this.findOrCreateByQuery(oldReport.query, currentReportLabel, oldReport.currency); // eski raporun query, periodLabel ve currency'siyle yeni bir rapor oluşturuyoruz. periodLabel'a timestamp ekleyelim ki aynı periodLabel ile yeni rapor oluşmasın.
        if (findNotExistingPaymentsForAccountId) {
            await this.includeOlderNotIncludedPayments(oldReport.query.ownerAccountId!, currentReportLabel, oldReport.id, brandNewReport.id);
        }

        // Yoğun bir işlem ama zaten sıklıkla çalıştırılacak bir method değil, gerektiğinde satıcı çalıştırabilir, ya da admin bilmiyorum.... Ayrıca raporlarda çok fazla payment olabilir, bu yüzden hepsini tek seferde güncellemek yerine digestion queue'ya atarak sırayla güncellemeyi planlıyorum.
        // TODO: Upsert'e bak belki for yapmamıza gerek kalmaz
        const relatedPaymentRelations = await this.reportPaymentRelationRepo.find({ where: { reportId: oldReport.id } });
        // Relation içinde olmayanlar da eklemeyi planlıyorum, ama şimdilik sadece relation içinde olanları güncelleyelim. 
        // Çünkü relation içinde olmayanların hangi raporlarla ilişkili olduğunu bilmiyoruz, o yüzden onları atlamak daha güvenli olabilir.
        for (const relation of relatedPaymentRelations) {
            await this.insertPaymentToReportDigestionSingle(brandNewReport.id, relation.paymentId, relation.accountId);
        }
    }

    toDto(entity: Report): ReportDTO {
        const dto = new ReportDTO();
        dto.id = entity.id;
        dto.queryId = entity.queryId;
        dto.periodLabel = entity.periodLabel;
        dto.currency = entity.currency;
        dto.netRevenue = entity.netRevenue;
        dto.totalSaleAmount = entity.totalSaleAmount;
        dto.totalRefundAmount = entity.totalRefundAmount;
        dto.totalSaleTaxAmount = entity.totalSaleTaxAmount;
        dto.totalRefundTaxAmount = entity.totalRefundTaxAmount;
        dto.netTaxAmount = entity.netTaxAmount;
        dto.netSaleAmount = entity.netSaleAmount;
        dto.paymentCount = entity.paymentCount;
        dto.lastDigestedAt = entity.lastDigestedAt;
        dto.createdAt = entity.createdAt;
        dto.archived = entity.archived;
        return dto;
    }

    async fetchInProgressReportIds(
        reportIds: string[]
    ): Promise<Map<String, String>> {
        const map = new Map<string, string>();
        const alreadyWorkingReports = (await this.reportPaymentRelationRepo.createQueryBuilder("relation")
            .select(["relation.reportId", 'relation.digestionStatus'])
            .where("relation.reportId in (:...reportIds)", { reportIds })
            .groupBy('relation.reportId')
            // Önce DIGESTING, sonra WAITING ve en son COMPLETED gelmesi gerekiyor
            // .orderBy("relation.reportId", "ASC")
            .addOrderBy("(case when relation.digestionStatus = 'DIGESTING' then 1 when relation.digestionStatus = 'WAITING' then 2 else 3 end)", "ASC")
            .getMany());
        for (const r of alreadyWorkingReports) {
            this.logger.log(r.reportId, r.digestionStatus)
            map.set(r.reportId, r.digestionStatus);
        }
        return map;

    }
}
