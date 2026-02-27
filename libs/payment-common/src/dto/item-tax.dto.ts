import { InternalSearchDTO } from "./internal-search.dto";

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

export class ItemTaxSearchDTO implements InternalSearchDTO {

    
    taxName: string;

    entityOwnershipGroupId?: string;

    showOnlyUserOwned?: "true" | "false";

    ownerUserId?: string;
}
