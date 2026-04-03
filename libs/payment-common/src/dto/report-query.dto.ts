export type ReportDateGrouping = 'DAILY' | 'WEEKLY' | 'MONTHLY' | 'YEARLY' | 'ALL';
export type ReportQueryType = 'REVENUE' | 'EXPENSE' | 'NET_INCOME' | 'CUSTOM';

export class ReportQueryDTO {
    id?: string;
    name: string;
    description?: string;
    ownerAccountId?: string;
    currency?: string;
    dateGrouping: ReportDateGrouping;
    createdAt?: Date | string;
    updatedAt?: Date | string;
}

export class ReportQueryCreateDTO {
    name: string;
    description?: string;
    ownerAccountId?: string;
    currency?: string;
    dateGrouping: ReportDateGrouping;
}

export class ReportQuerySearchDTO {
    ownerAccountId?: string;
}
