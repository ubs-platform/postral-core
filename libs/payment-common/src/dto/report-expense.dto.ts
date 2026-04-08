export const ITEM_CLASS_COMISSION_PREFIX = 'ITEM_CLASS_COMISSION:';
export const PLATFORM_COMISSION_TOTAL = 'PLATFORM_COMISSION_TOTAL';
export const REPORT_TOTAL = 'REPORT_TOTAL';
// Trol masraflar :d
export const SHAQ_ONEAL_ADVERTISEMENT_FEE = 'SHAQ_ONEAL_ADVERTISEMENT_FEE'; // Turkcell 5G reklamı
export const KOBE_BRYANT_RESURRECTION_AND_ADVERTISEMENT_FEE = 'KOBE_BRYANT_RESURRECTION_AND_ADVERTISEMENT_FEE'; // Turkcell 31G reklamı



export class ReportExpenseDTO {
    id!: string;
    reportId!: string;
    accountId!: string;
    expenseKey!: string;
    expenseAmount: number = 0;
    createdAt!: Date;
    updatedAt!: Date;
}