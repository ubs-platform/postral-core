import { ReportQueryDTO } from './report-query.dto';

export const SELLER_REPORT_SETUP_CURRENCIES = ['TRY', 'USD', 'EUR', 'GBP'] as const;
export const SELLER_REPORT_SETUP_GROUPINGS = ['DAILY', 'MONTHLY', 'YEARLY'] as const;
export type SellerReportSetupGrouping = typeof SELLER_REPORT_SETUP_GROUPINGS[number];

export class SellerReportSetupDTO {
    currency!: string;
    dateGroupings!: SellerReportSetupGrouping[];
}

export class SellerReportSetupResultDTO {
    accountId!: string;
    currency!: string;
    existing!: ReportQueryDTO[];
    created!: ReportQueryDTO[];
    missing!: SellerReportSetupGrouping[];
}
