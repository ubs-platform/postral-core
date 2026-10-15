export class ReportItemDTO {
    id!: string;

    reportId!: string;

    accountId?: string;
    /**
     * Report item key, idempotent unique identifier for the report item.
     */
    reportItemKey!: string;

    itemId!: string;


    itemName!: string;

    itemVariation!: string;

    itemQuantity: number = 0;

    itemTotalAmount: number = 0;

    itemTaxAmount: number = 0;

    itemDiscountAmount: number = 0;

    itemComissionAmount: number = 0;


    updatedAt!: Date;

    createdAt!: Date;

}