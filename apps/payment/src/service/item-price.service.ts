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
        // this.priceSearchDefaults(itemPriceSearchDto);
        this.regionDefault(itemPriceSearchDto);
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
        // this.priceSearchDefaults(itemPriceSearchDto);
        this.regionDefault(itemPriceSearchDto);
        const ls = await this.itemRepo
            .createQueryBuilder('item_price')
            .groupBy('itemId, variation, region, currency')
            .where(
                ' item_price.itemId = :itemId and ' +
                    ' (:variation is null or :variation = \"\" or item_price.variation = :variation) and ' +
                    ' item_price.region = :region and ' +
                    ' item_price.currency = :currency and ' +
                    ' (item_price.activeStartAt is null or item_price.activeStartAt <= :currentDate) and ' +
                    ' (item_price.activeExpireAt is null or item_price.activeExpireAt >= :currentDate)',
                {
                    itemId: itemPriceSearchDto.itemId,
                    variation: itemPriceSearchDto.variation,
                    region: itemPriceSearchDto.region,
                    currency: itemPriceSearchDto.currency,
                    currentDate: new Date().toUTCString(),
                },
            )
            .orderBy({ 'item_price.activityOrder': 'DESC' })
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
        this.regionDefault(itemPriceSearchDto);
        itemPriceSearchDto.variation =
            itemPriceSearchDto.variation || ItemPriceDefaults.VARIATION_DEFAULT;
    }

    private regionDefault(
        itemPriceSearchDto: ItemPriceSearchDTO | ItemPriceDTO,
    ) {
        itemPriceSearchDto.region =
            itemPriceSearchDto.region || ItemPriceDefaults.REGION_ANY;
    }
}
