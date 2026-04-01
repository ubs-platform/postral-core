
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