import { Injectable } from '@nestjs/common';
import { ItemPrice } from '../entity/item-price.entity';
import { ItemPriceDTO } from '@tk-postral/payment-common';

@Injectable()
export class ItemPriceMapper {
    async toDtoList(exist: ItemPrice[]): Promise<ItemPrice[]> {
        const items: ItemPrice[] = [];
        for (let index = 0; index < exist.length; index++) {
            const existAccount = exist[index];
            items.push(await this.toDto(existAccount));
        }
        return items;
    }

    async toDto(ac: ItemPrice): Promise<ItemPriceDTO> {
        return {
            id: ac.id,

            itemId: ac.itemId,

            variation: ac.variation,

            itemPrice: ac.itemPrice,

            taxPercent: ac.taxPercent,
            region: ac.region,
            currency: ac.currency,
            activityOrder: ac.activityOrder,
            activeExpireAt: ac.activeExpireAt,
            activeStartAt: ac.activeStartAt,
        };
    }

    async updateEntity(
        entity: ItemPrice,
        dto: ItemPriceDTO,
    ): Promise<ItemPrice> {
        // entity.id = dto.id;
        entity.itemId = dto.itemId;
        entity.variation = dto.variation;
        entity.itemPrice = dto.itemPrice;
        entity.taxPercent = dto.taxPercent;
        entity.region = dto.region;
        entity.currency = dto.currency;
        entity.activityOrder = dto.activityOrder;
        if (dto.activityOrder != 0) {
            entity.activeExpireAt = null!;
            entity.activeStartAt = null!;
        } else {
            entity.activeExpireAt = dto.activeExpireAt;
            entity.activeStartAt = dto.activeStartAt;
        }
        return entity;
    }

    // async updateEntityEdit(entity: ItemPrice, dto: ItemPriceDTO): Promise<ItemPrice> {
    //     // existing.id = dto.id,
    //     // entity.id = dto.id;

    //     entity.name = dto.name;

    //     entity.unit = dto.unit;

    //     entity.taxPercent = dto.taxPercent;

    //     entity.originalUnitAmount = dto.originalUnitAmount;

    //     return entity;
    // }
}
