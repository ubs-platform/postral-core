export interface PaymentItemInputDto {
    itemId: string;

    entityGroup: string;

    entityName: string;

    entityId: string;

    variation: string;

    quantity: number;

    totalAmount: number;

    taxPercent: number;
}
