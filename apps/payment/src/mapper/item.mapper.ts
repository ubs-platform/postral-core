import { AccountDTO, ItemDTO, ItemEditDTO } from '@tk-postral/payment-common';
import { Account } from '../entity/account.entity';
import { Inject, Injectable } from '@nestjs/common';
import { Item } from '../entity/item.entity';

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
            id: ac.id,

            name: ac.name,

            entityGroup: ac.entityGroup,

            entityName: ac.entityName,

            entityId: ac.entityId,

            unit: ac.unit,

            sellerAccountId: ac.sellerAccountId,
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

        return entity;
    }

    async updateEntityEdit(entity: Item, dto: ItemEditDTO): Promise<Item> {
        // existing.id = dto.id,
        // entity.id = dto.id;

        entity.name = dto.name;

        entity.unit = dto.unit;

        return entity;
    }
}
