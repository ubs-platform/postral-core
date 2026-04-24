import { ReportType } from "./report.dto";

export type ReportDateGrouping = 'DAILY' | 'WEEKLY' | 'MONTHLY' | 'YEARLY' | 'ALL';
export type ReportQueryType = 'REVENUE' | 'EXPENSE' | 'NET_INCOME' | 'CUSTOM';

export class ReportQueryDTO {
    id?: string;
    name: string = "";
    description?: string;
    ownerAccountId?: string;
    currency?: string;
    dateGrouping: ReportDateGrouping = "DAILY";
    createdAt?: Date | string;
    updatedAt?: Date | string;
    reportType: ReportType = "SELLER";
}

export class ReportQueryCreateDTO {
    name: string = "";
    description?: string;
    ownerAccountId?: string;
    currency?: string;
    dateGrouping: ReportDateGrouping = "DAILY";
    reportType: ReportType = "SELLER";
}

export class ReportQuerySearchDTO {
    ownerAccountId?: string;
    admin: "true" | "false" = "false";
}
