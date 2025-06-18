export interface PaymentItemDto {
    id: string;
    itemId: string;
    name: string;
    quantity: number;
    totalAmount: number;
    taxPercent: number;
    taxAmount: number;

    // itemType: 'PRODUCT' | 'DISCOUNT' | 'ADDITION' | 'OTHER';
    // taxPercent: number;
}
