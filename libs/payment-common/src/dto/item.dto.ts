export class ItemAddDTO {
    id: string;

    name: string;

    entityGroup: string;

    entityName: string;

    entityId: string;

    unit: string;

    // taxPercent: number;

    // unitAmount: number;

    // originalUnitAmount: number;

    sellerAccountId: string;
}

export class ItemDTO {
    id: string;

    name: string;

    entityGroup: string;

    entityName: string;

    entityId: string;

    unit: string;

    // taxPercent: number;

    // unitAmount: number;

    // originalUnitAmount: number;

    sellerAccountId: string;
}

export class ItemEditDTO {
    id: string;

    name: string;

    unit: string;

    // taxPercent: number;

    // originalUnitAmount: number;
}

export class ItemSearchDTO {
    id?: string;

    entityGroup?: string;

    entityName?: string;

    entityId?: string;
}
