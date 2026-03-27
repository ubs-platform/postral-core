
export interface BaseReport {
    paymentCount: number;

    // Toplam satın alma
    totalSaleAmount: number;

    // Toplam iade
    totalRefundAmount: number;

    // Toplam satın alma vergisi
    totalSaleTaxAmount: number;

    // Toplam iade vergisi
    totalRefundTaxAmount: number;

    // Net vergi (satın alma vergisi - iade vergisi)
    netTaxAmount: number;


    // Net satın alma (satın alma - iade)
    netSaleAmount: number;

    // Net gelir (net satın alma - net vergi)
    netRevenue: number;
}

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
}


export class ReportSearchDTO {
    queryId?: string;
    ownerAccountId?: string;
}