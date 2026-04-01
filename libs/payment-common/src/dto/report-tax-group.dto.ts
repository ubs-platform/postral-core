import { BaseReport } from "./base-report.dto";

export class ReportTaxGroupDTO implements BaseReport {
    taxGroupName: string;
    taxPercent: number;
    paymentCount: number;
    totalSaleAmount: number;
    totalRefundAmount: number;
    totalSaleTaxAmount: number;
    totalRefundTaxAmount: number;
    netTaxAmount: number;
    netSaleAmount: number;
    netRevenue: number;
}