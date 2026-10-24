export class ReportItemDTO {
    id!: string;

    reportId!: string;

    accountId?: string;
    /**
     * Report item key, idempotent unique identifier for the report item.
     */
    reportItemKey!: string;

    itemId!: string;

    identifiedByName: boolean = false;

    itemName!: string;

    itemVariation!: string;

    itemQuantity: number = 0;

    itemTotalAmount: number = 0;

    itemTaxAmount: number = 0;

    itemDiscountAmount: number = 0;

    itemComissionAmount: number = 0;



    purchasedQuantity: number = 0;

    purchasedTotalAmount: number = 0;

    purchasedTaxAmount: number = 0;

    purchasedDiscountAmount: number = 0;

    purchasedComissionAmount: number = 0;


    refundedQuantity: number = 0;

    refundedTotalAmount: number = 0;

    refundedTaxAmount: number = 0;

    refundedDiscountAmount: number = 0;

    refundedComissionAmount: number = 0;


    updatedAt!: Date;

    createdAt!: Date;

}