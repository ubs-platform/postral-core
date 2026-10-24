export const POSTRAL_INSTANCE = 'POSTRAL_INSTANCE';

export class ReportPlatformDTO {
    id!: string;
    reportId!: string;
    accountId!: string;
    platformKey!: string;
    externalPlatformId?: string;
    platformName!: string;
    purchaseCount: number = 0;
    refundCount: number = 0;
    soldQuantity: number = 0;
    refundedQuantity: number = 0;
    totalSaleAmount: number = 0;
    totalRefundAmount: number = 0;
    totalSaleTaxAmount: number = 0;
    totalRefundTaxAmount: number = 0;
    netSaleAmount: number = 0;
    netRevenue: number = 0;
}
