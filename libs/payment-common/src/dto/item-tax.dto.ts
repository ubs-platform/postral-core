
export class ItemTaxVariationDTO {
    taxMode: string;
    
    taxRate: number;
}

export class ItemTaxDTO {
    id: string;
    
    taxName: string;

    variations: ItemTaxVariationDTO[];

    entityOwnershipGroupId?: string;
}

export class ItemTaxSearchDTO {

    
    taxName: string;

    entityOwnershipGroupId?: string;

    admin?: 'true' | 'false';
}
