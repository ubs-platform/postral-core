export interface PaymentItemDto {
    id: string;
    name: string;
    quantity: number;
    totalAmount: number;
    taxPercent: number;
    taxedAmount: number;

    // itemType: 'PRODUCT' | 'DISCOUNT' | 'ADDITION' | 'OTHER';
    // taxPercent: number;
}
