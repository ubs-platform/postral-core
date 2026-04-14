export const ITEM_CLASS_COMISSION_PREFIX = 'ITEM_CLASS_COMISSION:';
export const PLATFORM_COMISSION_TOTAL = 'PLATFORM_COMISSION_TOTAL';
export const REPORT_TOTAL = 'REPORT_TOTAL';
export const PAYMENT_SERVICE_FEE = 'PAYMENT_SERVICE_FEE';
// Trol masraflar :d
export const SHAQ_ONEAL_ADVERTISEMENT_FEE = 'SHAQ_ONEAL_ADVERTISEMENT_FEE'; // Turkcell (0.)5G reklamı
export const KOBE_BRYANT_RESURRECTION_AND_ADVERTISEMENT_FEE = 'KOBE_BRYANT_RESURRECTION_AND_ADVERTISEMENT_FEE'; // Turkcell 31Ğ reklamı



export class ReportExpenseDTO {
    id!: string;
    reportId!: string;
    accountId!: string;
    expenseKey!: string;
    expenseAmount: number = 0;
    /** 1 = toplam masraf, 2 = komisyon/ödeme hizmeti ücreti, 3 = ürün grubu komisyonları */
    displayWeight: number = 2;
    createdAt!: Date;
    updatedAt!: Date;
}