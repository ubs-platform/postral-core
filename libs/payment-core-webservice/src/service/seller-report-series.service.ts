import {
    BadRequestException,
    ForbiddenException,
    Injectable,
    NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import {
    SELLER_REPORT_SIZES,
    SellerReportGrouping,
    SellerReportSeriesDTO,
    SellerReportSeriesSearchDTO,
} from '@tk-postral/payment-common';
import {
    Account,
    Report,
    ReportPaymentRelation,
    ReportQuery,
} from '@tk-postral/postral-entities';
import { UserAuthBackendDTO } from '@ubs-platform/users-common';
import { Between, In, Repository } from 'typeorm';
import { AuthUtilService } from './auth-util.service';
import { ReportDigestionService } from './report-digestion.service';
import { ReportMapper } from '../mapper/report-mapper';
import { ReportQueryMapper } from '../mapper/report-query.mapper';

@Injectable()
export class SellerReportSeriesService {
    constructor(
        @InjectRepository(Account)
        private readonly accounts: Repository<Account>,
        @InjectRepository(ReportQuery)
        private readonly queries: Repository<ReportQuery>,
        @InjectRepository(Report) private readonly reports: Repository<Report>,
        @InjectRepository(ReportPaymentRelation)
        private readonly relations: Repository<ReportPaymentRelation>,
        private readonly auth: AuthUtilService,
        private readonly digestion: ReportDigestionService,
        private readonly reportMapper: ReportMapper,
        private readonly queryMapper: ReportQueryMapper,
    ) {}

    async fetch(
        input: SellerReportSeriesSearchDTO,
        user: UserAuthBackendDTO,
    ): Promise<SellerReportSeriesDTO> {
        const size = Number(input.reportSize);
        if (
            typeof input.accountId !== 'string' ||
            !input.accountId.trim() ||
            typeof input.currency !== 'string' ||
            !/^[A-Z]{3}$/.test(input.currency) ||
            typeof input.dateGrouping !== 'string' ||
            !Object.prototype.hasOwnProperty.call(
                SELLER_REPORT_SIZES,
                input.dateGrouping,
            ) ||
            !['number', 'string'].includes(typeof input.reportSize) ||
            !Number.isInteger(size) ||
            !SELLER_REPORT_SIZES[input.dateGrouping].includes(size) ||
            (input.queryId !== undefined &&
                (typeof input.queryId !== 'string' || !input.queryId.trim())) ||
            (input.skipUnavailableReports !== undefined &&
                input.skipUnavailableReports !== true &&
                input.skipUnavailableReports !== false &&
                input.skipUnavailableReports !== 'true' &&
                input.skipUnavailableReports !== 'false')
        ) {
            throw new BadRequestException(
                'Invalid seller report series filters',
            );
        }
        const allowedIds = await this.auth.fetchUserAccountIds(user.id);
        if (!allowedIds.includes(input.accountId)) {
            throw new ForbiddenException(
                'You cannot view reports for this account',
            );
        }
        const account = await this.accounts.findOne({
            where: {
                id: input.accountId,
                type: 'COMMERCIAL',
                isExternal: false,
                deactivated: false,
            },
            select: ['id'],
        });
        if (!account) {
            throw new NotFoundException(
                'Active commercial seller account not found',
            );
        }

        const queries = await this.queries.find({
            where: {
                ownerAccountId: input.accountId,
                reportType: 'SELLER',
                dateGrouping: input.dateGrouping,
                currency: input.currency,
            },
            order: { name: 'ASC', id: 'ASC' },
        });
        const selected = input.queryId
            ? queries.find((query) => query.id === input.queryId)
            : queries.length === 1
              ? queries[0]
              : undefined;
        if (input.queryId && !selected) {
            throw new BadRequestException(
                'Report query does not match the selected seller filters',
            );
        }

        const now = new Date();
        const labels = this.periodLabels(input.dateGrouping, size, now);
        const result: SellerReportSeriesDTO = {
            accountId: input.accountId,
            currency: input.currency,
            dateGrouping: input.dateGrouping,
            reportSize: size,
            queries: queries.map((query) => this.queryMapper.toDto(query)),
            selectedQueryId: selected?.id,
            periods: [],
            hasPendingRecords: false,
            hasFailedRecords: false,
            generatedAt: now.toISOString(),
        };
        // A query is a distinct source; multiple matching queries must never be summed or chosen arbitrarily.
        if (!selected) return result;

        const reports = await this.reports.find({
            where: {
                queryId: selected.id,
                reportType: 'SELLER',
                currency: input.currency,
                archived: false,
                periodLabel: Between(labels[0], labels[labels.length - 1]),
            },
            relations: ['query', 'query.account'],
            order: { periodLabel: 'ASC' },
        });
        const byLabel = new Map(
            reports.map((report) => [report.periodLabel, report]),
        );
        result.periods = labels.map((periodLabel) => ({
            periodLabel,
            isCurrentPeriod: periodLabel === labels[labels.length - 1],
            report: byLabel.has(periodLabel)
                ? this.reportMapper.toDto(byLabel.get(periodLabel)!)
                : null,
        }));
        if (
            input.skipUnavailableReports === true ||
            input.skipUnavailableReports === 'true'
        ) {
            result.periods = result.periods.filter(
                (period) => period.report !== null,
            );
        }
        const reportIds = result.periods.flatMap((period) =>
            period.report ? [period.report.id] : [],
        );
        if (reportIds.length) {
            const [pending, failed] = await Promise.all([
                this.relations.existsBy({
                    reportId: In(reportIds),
                    digestionStatus: In(['WAITING', 'DIGESTING']),
                }),
                this.relations.existsBy({
                    reportId: In(reportIds),
                    digestionStatus: 'FAILED',
                }),
            ]);
            result.hasPendingRecords = pending;
            result.hasFailedRecords = failed;
        }
        return result;
    }

    private periodLabels(
        grouping: SellerReportGrouping,
        size: number,
        now: Date,
    ): string[] {
        // Match the local calendar used when digestion originally assigned periodLabel.
        const cursor = new Date(
            now.getFullYear(),
            grouping === 'YEARLY' ? 0 : now.getMonth(),
            grouping === 'DAILY' ? now.getDate() : 1,
            12,
        );
        const labels: string[] = [];
        for (let index = 0; index < size; index++) {
            labels.unshift(this.digestion.buildPeriodLabel(grouping, cursor));
            if (grouping === 'DAILY') cursor.setDate(cursor.getDate() - 1);
            else if (grouping === 'MONTHLY')
                cursor.setMonth(cursor.getMonth() - 1);
            else cursor.setFullYear(cursor.getFullYear() - 1);
        }
        return labels;
    }
}
