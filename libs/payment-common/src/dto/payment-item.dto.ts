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
    entityGroup: string;
    entityId: string;
    entityName: string;
    entityOwnerAccountId: string;
    unTaxAmount: number;
    originalUnitAmount: number;
    unitAmount: number;
    // itemType: 'PRODUCT' | 'DISCOUNT' | 'ADDITION' | 'OTHER';
    // taxPercent: number;
}
