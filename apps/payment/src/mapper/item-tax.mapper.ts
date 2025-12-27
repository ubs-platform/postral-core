import { Injectable } from "@nestjs/common";
import { ItemTaxEntity, ItemTaxVariation } from "../entity";
import { ItemTaxDTO } from "@tk-postral/payment-common";

@Injectable()
export class ItemTaxMapper {
    toDTO(entity: ItemTaxEntity): ItemTaxDTO {
        return {
            id: entity.id,
            taxName: entity.taxName,
            variations: entity.variations?.map(variation => ({
                taxMode: variation.taxMode,
                taxRate: variation.taxRate
            }))
        };
    }

    updateEntity(entity: ItemTaxEntity, dto: ItemTaxDTO): ItemTaxEntity {
        entity.taxName = dto.taxName;
        entity.variations = dto.variations?.map(variationDto => {
            const variation = new ItemTaxVariation();
            variation.taxMode = variationDto.taxMode;
            variation.taxRate = variationDto.taxRate;
            variation.itemTax = entity;
            return variation;
        }) || [];
        return entity;
    }
}