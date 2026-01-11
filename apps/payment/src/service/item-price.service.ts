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
import * as moment from 'moment';

@Injectable()
export class ItemPriceService {
    async deletePrice(itemId: string, priceId: string) {
        const price = await this.itemRepo.findOne({
            where: { id: priceId, itemId },
        });
        if (!price) {
            throw new NotFoundException(`Price with id ${priceId} not found`);
        }
        await this.itemRepo.remove(price);
    }
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
        const now = this.nowString();
        const ls = await this.itemRepo
            .createQueryBuilder('item_price')
            .where(
                `item_price.id=( select ip2.id from item_price ip2 where 
                    item_price.region=ip2.region and item_price.currency=ip2.currency and item_price.itemId=ip2.itemId and item_price.variation=ip2.variation 
                    and ip2.itemId = :itemId 
                    and (:variation is null or :variation = '' or ip2.variation = :variation)
                    and ip2.region = :region
                    and ip2.currency = :currency
                    and ( (ip2.activeStartAt is null) or (ip2.activeStartAt < :currentDate)) and ( (ip2.activeExpireAt is null) or  (ip2.activeExpireAt > :currentDate) ) order by ip2.activityOrder desc limit 1 offset 0 )`,
                {
                    itemId: itemPriceSearchDto.itemId,
                    variation: itemPriceSearchDto.variation?.toString() || '',
                    region: itemPriceSearchDto.region?.toString() || '',
                    currency: itemPriceSearchDto.currency?.toString() || '',
                    currentDate: now,
                },
            )
            .getMany();
        return await this.itemPriceMapper.toDtoList(ls);
    }

    private nowString(): any {
        return moment().utc().format('yyyy-MM-DD hh:mm:ss');
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

    async getLatestActivityOrder(itemPriceSearchDto: ItemPriceSearchDTO) {
        this.priceSearchDefaults(itemPriceSearchDto);
        const latest = await this.allLatestPrices(itemPriceSearchDto);

        return latest ? latest[0].activityOrder : null;
    }
}
