import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import {
    ItemDTO,
    ItemEditDTO,
    ItemPriceDTO,
    ItemSearchDTO,
} from '@tk-postral/payment-common';
import { Account } from '../entity/account.entity';
import { Item } from '../entity/item.entity';
import { ItemMapper } from '../mapper/item.mapper';
import { ItemPrice } from '../entity/item-price.entity';

@Injectable()
export class ItemPriceService {
    constructor(
        @InjectRepository(ItemPrice)
        private readonly itemRepo: Repository<ItemPrice>,
    ) {}

    async allDefaultPrices(
        itemId: string,
        variation = ItemPriceDTO.VARIATION_DEFAULT,
    ) {
        return await this.itemRepo.find({
            where: {
                itemId,
                variation,
                activityOrder: 0,
            },
        });
    }

    async allLatestPrices(
        itemId: string,
        variation = ItemPriceDTO.VARIATION_DEFAULT,
    ) {
        return await this.itemRepo.find({
            where: {
                itemId,
                variation,
                activityOrder: 0,
            },
        });
    }
}
