import { ReportDateGrouping, ReportQueryDTO } from './report-query.dto';
import { ReportDTO } from './report.dto';

export type SellerReportGrouping = Extract<
    ReportDateGrouping,
    'DAILY' | 'MONTHLY' | 'YEARLY'
>;

export const SELLER_REPORT_SIZES: Record<
    SellerReportGrouping,
    readonly number[]
> = {
    DAILY: [7, 15, 30, 90, 180, 365, 730, 1461],
    MONTHLY: [1, 3, 6, 12, 24, 48],
    YEARLY: [1, 2, 4],
};

export class SellerReportSeriesSearchDTO {
    accountId!: string;
    currency!: string;
    dateGrouping!: SellerReportGrouping;
    reportSize!: number;
    queryId?: string;
    skipUnavailableReports?: boolean | 'true' | 'false';
}

export class SellerReportPeriodDTO {
    periodLabel!: string;
    isCurrentPeriod!: boolean;
    report!: ReportDTO | null;
}

export class SellerReportSeriesDTO {
    accountId!: string;
    currency!: string;
    dateGrouping!: SellerReportGrouping;
    reportSize!: number;
    queries!: ReportQueryDTO[];
    selectedQueryId?: string;
    periods!: SellerReportPeriodDTO[];
    hasPendingRecords!: boolean;
    hasFailedRecords!: boolean;
    generatedAt!: string;
}
