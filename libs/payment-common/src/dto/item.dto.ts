export class ItemAddDTO {
    id: string;

    name: string;

    entityGroup: string;

    entityName: string;

    entityId: string;

    unit: string;

    itemTaxId: string;

    // taxPercent: number;

    // unitAmount: number;

    // originalUnitAmount: number;

    sellerAccountId: string;

    baseCurrency: string;

    entityOwnershipGroupId?: string;
    

}

export class ItemDTO {
    id: string;

    name: string;

    entityGroup: string;

    entityName: string;

    entityId: string;

    unit: string;

    itemTaxId: string;


    // taxPercent: number;

    // unitAmount: number;

    // originalUnitAmount: number;

    sellerAccountId: string;

    baseCurrency: string;
}

export class ItemEditDTO {
    id: string;

    name: string;

    unit: string;

    itemTaxId: string;


    // taxPercent: number;

    // originalUnitAmount: number;
}

export class ItemSearchDTO {
    id?: string;

    entityGroup?: string;

    entityName?: string;

    entityId?: string;

    entityOwnershipGroupId?: string;

    ownerUserId?: string;

    // admin?: 'true' | 'false';

    // fetchAll?: "true" | "false";

    name?: string;
}
