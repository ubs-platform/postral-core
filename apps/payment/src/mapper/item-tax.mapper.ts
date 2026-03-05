import { Injectable } from "@nestjs/common";
import { ItemTaxEntity, ItemTaxVariation } from "../entity";
import { ItemTaxDTO } from "@tk-postral/payment-common";

@Injectable()
export class ItemTaxMapper {
    toDTO(entity: ItemTaxEntity): ItemTaxDTO {
        // exec(`kdialog --msgbox 'ItemTaxMapper toDTO entity variations length: ${entity.variations?.length}'`);
        const dto = new ItemTaxDTO();
        dto.id = entity.id;
        dto.taxName = entity.taxName;
        dto.isPublic = entity.isPublic;
        dto.variations = entity.variations?.map(variation => {
            return {
                taxMode: variation.taxMode,
                taxRate: variation.taxRate
            };
        }) || [];
        return dto;

    }

    updateEntity(entity: ItemTaxEntity, dto: ItemTaxDTO): ItemTaxEntity {
        entity.taxName = dto.taxName;
        entity.isPublic = dto.isPublic;
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