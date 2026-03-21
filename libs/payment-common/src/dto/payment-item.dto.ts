export interface PaymentItemDto {
    id: string;
    itemId: string;
    name: string;
    quantity: number;
    totalAmount: number;
    taxPercent: number;
    taxAmount: number;
    variation: string;
    sellerAccountId: string;
    sellerAccountName: string;
    entityGroup: string;
    entityId: string;
    entityName: string;
    unTaxAmount: number;
    originalUnitAmount: number;
    unitAmount: number;
    unit: string;
    refundCount?: number;
}

export class PaymentItemDto implements PaymentItemDto {
    constructor(partial: Partial<PaymentItemDto>) {
        Object.assign(this, partial);
    }
}
