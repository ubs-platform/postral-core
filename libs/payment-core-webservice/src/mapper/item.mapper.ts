import { AccountDTO, ItemDTO, ItemEditDTO } from '@tk-postral/payment-common';
import { Account, Item } from '@tk-postral/postral-entities';
import { Inject, Injectable } from '@nestjs/common';
import e from 'express';

@Injectable()
export class ItemMapper {
    async toDtoList(exist: Item[]): Promise<ItemDTO[]> {
        const items: ItemDTO[] = [];
        for (let index = 0; index < exist.length; index++) {
            const existAccount = exist[index];
            items.push(await this.toDto(existAccount));
        }
        return items;
    }

    async toDto(ac: Item): Promise<ItemDTO> {
        
        return {
            itemTaxId: ac.itemTaxId,

            id: ac.id,

            name: ac.name,

            entityGroup: ac.entityGroup,

            entityName: ac.entityName,

            entityId: ac.entityId,

            unit: ac.unit,

            sellerAccountId: ac.sellerAccountId,
            baseCurrency: ac.baseCurrency,
            itemClass: ac.itemClass
        };
    }

    async updateEntity(entity: Item, dto: ItemDTO): Promise<Item> {
        // existing.id = dto.id,
        // entity.id = dto.id;

        entity.name = dto.name;

        entity.entityGroup = dto.entityGroup;

        entity.entityName = dto.entityName;

        entity.entityId = dto.entityId;

        entity.unit = dto.unit;

        entity.sellerAccountId = dto.sellerAccountId;
        entity.baseCurrency = dto.baseCurrency;
        entity.itemTaxId = dto.itemTaxId;
        entity.itemClass = dto.itemClass || "";
        return entity;
    }

    async updateEntityEdit(entity: Item, dto: ItemEditDTO): Promise<Item> {
        // existing.id = dto.id,
        // entity.id = dto.id;

        entity.name = dto.name;

        entity.unit = dto.unit;
        entity.itemTaxId = dto.itemTaxId;
        entity.itemClass = dto.itemClass || "";
        return entity;
    }
}
