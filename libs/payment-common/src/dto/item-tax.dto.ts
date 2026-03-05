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

    isPublic: boolean;
}

export class ItemTaxSearchDTO implements InternalSearchDTO {

    entityOwnershipGroupId?: string;

    // iç kullanım için
    entityIds?: string[];

    admin?: "true" | "false";

    taxName: string;

    ownerUserId?: string;

    //** PUBLIC ise sadece public olanları getir, PRIVATE ise sadece ownerUserId ile belirtilen kullanıcıya ait olanları getir. Eğer NONE ya da undefined ise tümünü getir. */
    visibility?: "PUBLIC" | "PRIVATE" | "NONE";
}
