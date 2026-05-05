import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { In, Repository } from 'typeorm';
import { TypeormSearchUtil } from './base/typeorm-search-util';

import { ReportDTO, ReportFullDTO, ReportSearchPaginationDTO } from '@tk-postral/payment-common';

import { PaymentCommonService } from './payment-common.service';
import { ReportReconstructionDTO } from '@tk-postral/payment-common/dto';
import { ReportMapper } from '../mapper/report-mapper';
import { UserAuthBackendDTO } from '@ubs-platform/users-common';
import { AuthUtilService } from './auth-util.service';
import { SearchResult } from '@ubs-platform/crud-base-common';
import { ReportDigestionService } from './report-digestion.service';
import { ReportTaxGroup, ReportExpense, ReportPaymentRelation, Report } from '@tk-postral/postral-entities';

@Injectable()
export class ReportService {

    private readonly logger = new Logger(ReportService.name);

    constructor(
        @InjectRepository(Report)
        private readonly reportRepo: Repository<Report>,
        @InjectRepository(ReportTaxGroup)
        private readonly taxGroupRepo: Repository<ReportTaxGroup>,
        @InjectRepository(ReportExpense)
        private readonly expenseRepo: Repository<ReportExpense>,
        @InjectRepository(ReportPaymentRelation)
        private readonly reportPaymentRelationRepo: Repository<ReportPaymentRelation>,
        private readonly paymentCommonService: PaymentCommonService,
        private readonly reportMapper: ReportMapper,
        private readonly authUtil: AuthUtilService,
        private readonly reportDigestionService: ReportDigestionService,
    ) { }


    async findByQueryId(queryId: string): Promise<ReportDTO[]> {
        const reports = await this.reportRepo.find({
            where: { queryId },
            order: { periodLabel: 'DESC' },
        });
        return reports.map(r => this.reportMapper.toDto(r));
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
        )).map(r => this.reportMapper.toDto(r));
    }

    /**
     * Herhangi bir reporta (report payment relation tablosuna) dahil olmayan paymentları accountId'ye göre relation'a WAITING statüsünde eklenir.
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
            const periodLabel = this.reportDigestionService.buildPeriodLabel(
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
                digestionStatus: 'WAITING',
            });
        }

        if (batchInsert.length > 0) {
            try {
                await this.reportPaymentRelationRepo.insert(batchInsert);
            } catch (error: any) {
                this.logger.error(`Failed to insert report payment relations for report reconstruction. ReportId: ${newReportId}, Error: ${error?.message}`);
            }
        }
    }

    /**
     * Eski report'u farklı isimle kaydedip yeni report açacak. Sonra da tüm paymentlar tekrar waiting'e çekilecek ve digestion queue'ya girecek. Böylece eski report'taki tüm paymentlar yeni report'ta tekrar işlenecek ve rapor güncellenecek.
     */
    async reportReconstruct(reconstruction: ReportReconstructionDTO) {
        const { reportId, findNotExistingPaymentsForAccountId } = reconstruction;
        let oldReport = await this.reportRepo.findOne({ where: { id: reportId }, relations: ['query'] });
        if (!oldReport) {
            throw new Error(`Report ${reportId} not found`);
        }
        if (oldReport.query == null) {
            throw new Error(`Report ${reportId} has no query loaded.`);
        }
        if (oldReport.query.ownerAccountId == null) {
            throw new Error(`Report ${reportId} has no query ownerAccountId.`);
        }
        if (oldReport.archived) {
            throw new Error(`Report ${reportId} is already archived.`);
        }
        const currentReportLabel = oldReport.periodLabel;
        oldReport.periodLabel = oldReport.periodLabel + '_OLD_' + Date.now();
        oldReport.archived = true;
        oldReport = await this.reportRepo.save(oldReport);
        const brandNewReport = await this.reportDigestionService.findOrCreateByQuery(oldReport.query, currentReportLabel, oldReport.currency);
        if (findNotExistingPaymentsForAccountId) {
            await this.includeOlderNotIncludedPayments(oldReport.query.ownerAccountId!, currentReportLabel, oldReport.id, brandNewReport.id);
        }

        const relatedPaymentRelations = await this.reportPaymentRelationRepo.find({ where: { reportId: oldReport.id } });
        for (const relation of relatedPaymentRelations) {
            await this.reportDigestionService.insertPaymentToReportDigestionSingle(brandNewReport.id, relation.paymentId, relation.accountId);
        }
    }

    async fetchInProgressReportIds(
        reportIds: string[]
    ): Promise<Map<String, String>> {
        if (reportIds.length === 0) {
            return new Map<string, string>();
        }
        const map = new Map<string, string>();
        const alreadyWorkingReports = await this.reportPaymentRelationRepo
            .createQueryBuilder('relation')
            .select(['relation.reportId', 'relation.digestionStatus', 'report.archived'])
            .leftJoin('relation.report', 'report', 'report.id = relation.reportId')
            .where('relation.reportId in (:...reportIds)', { reportIds })
            .groupBy('relation.reportId')
            .addOrderBy("(case when relation.digestionStatus = 'DIGESTING' then 1 when relation.digestionStatus = 'WAITING' then 2 else 3 end)", 'ASC')
            .getMany();
        for (const r of alreadyWorkingReports) {
            const archived = r.report.archived;
            this.logger.log(r.reportId, r.digestionStatus, archived);
            map.set(r.reportId, r.digestionStatus + (archived ? '_ARCHIVED' : ''));
        }
        return map;
    }

    async fetchReportFull(reportId: string): Promise<ReportFullDTO> {
        const [mainReport, taxGroupReports, reportExpenses] = await Promise.all([
            this.reportRepo.findOne({ where: { id: reportId } }),
            this.taxGroupRepo.find({ where: { reportId } }),
            this.expenseRepo.find({ where: { reportId }, order: { displayWeight: 'ASC' } }),
        ]);
        if (!mainReport) {
            throw new Error(`Report ${reportId} not found`);
        }
        return this.reportMapper.toFullDto(mainReport, taxGroupReports, reportExpenses);
    }

    async searchPagination(q: ReportSearchPaginationDTO, user: UserAuthBackendDTO): Promise<SearchResult<ReportDTO>> {
        let userRelatedAccountIds: string[] = [];
        if (q.admin !== 'true' && user) {
            userRelatedAccountIds = await this.authUtil.fetchUserAccountIds(user.id, ['OWNER', 'EDITOR', 'VIEWER']);
        }

        // Eğer accountId yoksa ve admin değilse, boş sonuç döndürelim
        if (userRelatedAccountIds.length === 0 && q.admin !== 'true') {
            return {
                content: [],
                maxItemLength: 0,
                maxPagesIndex: 0,
                page: 0,
                size: 0,
                firstPage: true,
                lastPage: true,
            };
        }

        return await TypeormSearchUtil.modelSearch<Report>(
            this.reportRepo,
            q.size || 10,
            q.page || 0,
            { periodLabel: 'desc' },
            [],
            {
                queryId: q.queryId,
                ...((q.includeArchived === 'true') || q.includeArchived === true ? {} : { archived: false }),
                ...((userRelatedAccountIds.length > 0) ? { accountId: In(userRelatedAccountIds) } : {}),
            },
        ).then(result => result.map(r => this.reportMapper.toDto(r)));
    }
}
