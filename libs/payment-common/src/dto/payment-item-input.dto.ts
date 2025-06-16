export interface PaymentItemInputDto {
    itemId: string;

    entityGroup: string;

    entityName: string;

    entityId: string;

    quantity: number;

    totalAmount: number;

    taxPercent: number;
}
