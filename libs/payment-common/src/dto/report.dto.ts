export class ReportDTO {
    id: string;
    queryId: string;
    periodLabel: string;
    currency: string;
    totalRevenue: number;
    totalExpense: number;
    netIncome: number;
    totalTaxAmount: number;
    paymentCount: number;
    lastDigestedAt?: Date | string;
    createdAt?: Date | string;
}
