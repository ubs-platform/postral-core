export class PaymentItemInputDto {
    itemId?: string;

    note?: string;

    entityGroup?: string;

    entityName?: string;

    entityId?: string;
    variation?: string;

    quantity!: number;
    unit?: string;
}
