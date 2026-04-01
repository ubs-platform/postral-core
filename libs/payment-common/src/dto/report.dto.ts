import { BaseReport } from "./base-report.dto";


export class ReportDTO implements BaseReport {

    id: string;
    queryId: string;
    periodLabel: string;
    currency: string;
    paymentCount: number;
    lastDigestedAt?: Date | string;
    createdAt?: Date | string;
    totalSaleAmount: number;
    totalRefundAmount: number;
    totalSaleTaxAmount: number;
    totalRefundTaxAmount: number;
    netTaxAmount: number;
    netSaleAmount: number;
    netRevenue: number;
    archived?: boolean;
}


export class ReportSearchDTO {
    queryId?: string;
    ownerAccountId?: string;
}