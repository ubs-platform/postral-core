import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { LessThanOrEqual, MoreThanOrEqual, Or, Repository } from 'typeorm';
import {
    ItemDTO,
    ItemEditDTO,
    ItemPriceDefaults,
    ItemPriceDTO,
    ItemPriceSearchDTO,
    ItemSearchDTO,
} from '@tk-postral/payment-common';
import { Account } from '../entity/account.entity';
import { Item } from '../entity/item.entity';
import { ItemMapper } from '../mapper/item.mapper';
import { ItemPrice } from '../entity/item-price.entity';
import { ItemPriceMapper } from '../mapper/item-price.mapper';

@Injectable()
export class ItemPriceService {
    constructor(
        @InjectRepository(ItemPrice)
        private readonly itemRepo: Repository<ItemPrice>,
        private readonly itemPriceMapper: ItemPriceMapper,
    ) {}

    async allDefaultPrices(itemPriceSearchDto: ItemPriceSearchDTO) {
        this.priceSearchDefaults(itemPriceSearchDto);
        const ls = await this.itemRepo.find({
            where: {
                itemId: itemPriceSearchDto.itemId as any,
                variation: itemPriceSearchDto.variation,
                region: itemPriceSearchDto.region,
                currency: itemPriceSearchDto.currency,
                activityOrder: 0,
            },
        });
        return await this.itemPriceMapper.toDtoList(ls);
    }

    async allLatestPrices(itemPriceSearchDto: ItemPriceSearchDTO) {
        this.priceSearchDefaults(itemPriceSearchDto);
        const ls = await this.itemRepo
            .createQueryBuilder('item_price')
            .where({
                itemId: itemPriceSearchDto.itemId,
                variation: itemPriceSearchDto.variation,
                region: itemPriceSearchDto.region,
                currency: itemPriceSearchDto.currency,
                activeStartAt: Or(null!, LessThanOrEqual(new Date())),
                activeExpireAt: Or(null!, MoreThanOrEqual(new Date())),
            })
            .distinctOn([
                'item_price.item_id',
                'item_price.variation',
                'item_price.region',
                'item_price.currency',
            ])
            .orderBy({ 'item_price.activity_order': 'DESC' })
            .getMany();

        return await this.itemPriceMapper.toDtoList(ls);
    }

    async setDefaultPrice(dto: ItemPriceDTO) {
        this.priceSearchDefaults(dto);
        dto.activityOrder = 0;
        const exist = await this.itemRepo.find({
            where: {
                itemId: dto.itemId,
                variation: dto.variation,
                region: dto.region,
                currency: dto.currency,
                activityOrder: dto.activityOrder,
            },
        });
        let entity = exist[0] ?? new ItemPrice();
        entity = await this.itemPriceMapper.updateEntity(entity, dto);
        entity = await this.itemRepo.save(entity);
        return await this.itemPriceMapper.toDto(entity);
    }

    private priceSearchDefaults(
        itemPriceSearchDto: ItemPriceSearchDTO | ItemPriceDTO,
    ) {
        itemPriceSearchDto.region =
            itemPriceSearchDto.region || ItemPriceDefaults.REGION_ANY;
        itemPriceSearchDto.variation =
            itemPriceSearchDto.variation || ItemPriceDefaults.VARIATION_DEFAULT;
    }
}
