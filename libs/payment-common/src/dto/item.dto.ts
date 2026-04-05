import { InternalSearchDTO } from "./internal-search.dto";

export class ItemAddDTO {
    id!: string;

    name!: string;

    entityGroup!: string;

    entityName!: string;

    entityId!: string;

    unit!: string;

    itemTaxId!: string;

    // taxPercent: number;

    // unitAmount: number;

    // originalUnitAmount: number;

    sellerAccountId!: string;

    baseCurrency!: string;

    entityOwnershipGroupId?: string;

    itemClass?: string;


}

export class ItemDTO {
    id!: string;

    name!: string;

    entityGroup!: string;

    entityName!: string;

    entityId!: string;

    unit!: string;

    itemTaxId!: string;


    // taxPercent: number;

    // unitAmount: number;

    // originalUnitAmount: number;

    sellerAccountId!: string;

    baseCurrency!: string;

    itemClass?: string;

}

export class ItemEditDTO {
    id!: string;

    name!: string;

    unit!: string;

    itemTaxId!: string;

    itemClass?: string;

    // taxPercent: number;

    // originalUnitAmount: number;
}

export class ItemSearchDTO implements InternalSearchDTO {
    id?: string;

    entityGroup?: string;

    entityName?: string;

    name?: string;

    showOnlyUserOwned?: "true" | "false";

    /**
     * Bu entityIds ile karıştırılmamalıdır. entityIds, bir entityOwnershipGroupId 
     * altında aranacak id'leri belirtirken, 
     * entityId tek bir item'ın hangi varlık altında olduğunu belirtmek için kullanılır.
     * entityGroup ile entityName ikilisi birlikte kullanılmalı. 
     * Bu ikili, itemların hangi varlık altında olduğunu belirtmek için kullanılır. 
     * Örneğin, bir item bir faturaya ait olabilir. 
     * Bu durumda, bir kasa uygulamasında entityGroup "KASA_APP", entityName ise Ürün ismi ya da kendi içerisinde ayrılan gruplar'ın
     *  id'si olabilir.
     * Bu sayede, aynı id'ye sahip itemlar farklı varlıklar altında birbirinden ayrılabilir.
     */
    entityId?: string;

    entityOwnershipGroupId?: string;

    itemClass?: string;

}
