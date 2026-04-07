import { BaseReport } from "./base-report.dto";

export class ReportTaxGroupDTO implements BaseReport {
    taxGroupName: string = "";
    taxPercent: number = 0;
    paymentCount: number = 0;
    totalSaleAmount: number = 0;
    totalRefundAmount: number = 0;
    totalSaleTaxAmount: number = 0;
    totalRefundTaxAmount: number = 0;
    netTaxAmount: number = 0;
    netSaleAmount: number = 0;
    netRevenue: number = 0;
    totalExpenseAmount: number = 0;
    totalSaleAmountWithoutExpense: number = 0;
}