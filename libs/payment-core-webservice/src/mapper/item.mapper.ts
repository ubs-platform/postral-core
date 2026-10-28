import { AccountDTO, ItemDTO, ItemEditDTO } from '@tk-postral/payment-common';
import { Account, Item } from '@tk-postral/postral-entities';
import { BadRequestException, Inject, Injectable } from '@nestjs/common';
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

            isPhysical: ac.isPhysical,
            metaEntityGroup: ac.metaEntityGroup,
            metaEntityName: ac.metaEntityName,
            metaEntityId: ac.metaEntityId,

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

        this.updateItemDetails(entity, dto);

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

        this.updateItemDetails(entity, dto);

        entity.unit = dto.unit;
        entity.itemTaxId = dto.itemTaxId;
        entity.itemClass = dto.itemClass || "";
        return entity;
    }

    private updateItemDetails(entity: Item, dto: ItemEditDTO): void {
        if (dto.isPhysical !== undefined) {
            if (typeof dto.isPhysical !== 'boolean') {
                throw new BadRequestException('isPhysical must be a boolean');
            }
            entity.isPhysical = dto.isPhysical;
        }
        for (const field of ['metaEntityGroup', 'metaEntityName', 'metaEntityId'] as const) {
            if (dto[field] !== undefined) {
                if (dto[field] !== null && typeof dto[field] !== 'string') {
                    throw new BadRequestException(`${field} must be a string or null`);
                }
                entity[field] = dto[field];
            }
        }
    }
}
