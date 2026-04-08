import { BaseReport } from "./base-report.dto";
import { SearchRequest } from "@ubs-platform/crud-base-common";

export class ReportDTO implements BaseReport {

    id!: string;
    queryId!: string;
    periodLabel!: string;
    currency!: string;
    paymentCount!: number;
    lastDigestedAt?: Date | string;
    createdAt?: Date | string;
    totalSaleAmount!: number;
    totalRefundAmount!: number;
    totalSaleTaxAmount!: number;
    totalRefundTaxAmount!: number;
    netTaxAmount!: number;
    netSaleAmount!: number;
    netRevenue!: number;
    archived?: boolean;
    totalExpenseAmount!: number;
    totalSaleAmountWithoutExpense!: number;
}


export class ReportSearchDTO {
    queryId?: string;
    // virgül ile ayrılmış birden fazla accountId gönderilebilir, bu durumda bu accountId'lere ait raporlar döner
    ownerAccountIds?: string[] | string;
    includeArchived?: "true" | "false" | boolean;
    periodLabel?: string;
    admin?: "true" | "false";
}

export class ReportSearchPaginationDTO extends ReportSearchDTO implements SearchRequest {
    page!: number;
    size!: number;
    sortBy?: string;
    sortRotation?: 'desc' | 'asc';
}