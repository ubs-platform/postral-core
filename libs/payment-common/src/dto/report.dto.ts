import { BaseReport } from "./base-report.dto";
import { SearchRequest } from "@ubs-platform/crud-base-common";

/**
 * Seller: Seller'in kazancı ve giderleri, yani müşteriden aldığı toplam ödeme - yaptığı toplam iade - satıcıya ödediği toplam ödeme - giderler
 * Platform: Platformun kazancı, Satıcılardan aldığı komisyonlar ve diğer ücretler - platformun ödediği toplam ödeme - giderler
 * PlatformFlow: Platforma giren ve çıkan para akışı, yani müşteriden alınan toplam ödeme - yapılan toplam iade
 * PlatformSeller: Platformun satıcıya ödediği toplam ödeme - satıcılardan aldığı toplam komisyonlar ve diğer ücretler. Faturalandırma için bu kullanılacak
 */
export type ReportType = "SELLER" | "PLATFORM_FLOW" | "PLATFORM_SELLER" | "PLATFORM";

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
    reportType!: ReportType;
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