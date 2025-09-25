import {
    Controller,
    Get,
    Post,
    Put,
    Delete,
    Param,
    Body,
    Query,
    BadRequestException,
} from '@nestjs/common';
import { AccountService } from '../service/account.service';
import {
    ItemDTO,
    ItemPriceDefaults,
    ItemPriceDTO,
    ItemSearchDTO,
} from '@tk-postral/payment-common';
import { ItemService } from '../service/item.service';
import { ItemPriceService } from '../service/item-price.service';

@Controller('item')
export class ItemAdminController {
    constructor(
        private readonly accountService: ItemService,
        private readonly itemPriceService: ItemPriceService,
    ) {}

    @Get()
    async findAll(@Query() itemSearch: ItemSearchDTO): Promise<ItemDTO[]> {
        // admin ise tümü, değilse kendi oluşturdukları vs
        return this.accountService.fetchAll(itemSearch);
    }

    @Get(':id')
    async findOne(@Param('id') id: string): Promise<ItemDTO> {
        // admin ise tümü, değilse kendi oluşturdukları vs
        // sahip account idleri yükle
        return await this.accountService.fetchOne(id);
    }

    private async checkBeforAdd(account: ItemDTO) {
        if (account.entityGroup || account.entityName || account.entityId) {
            if (
                !(account.entityGroup && account.entityName && account.entityId)
            ) {
                throw new BadRequestException(
                    'All of entityGroup, entityName and entityId are required. If do not want provide these informations, leave empty',
                );
            } else if (
                (
                    await this.accountService.fetchAll({
                        entityGroup: account.entityGroup,
                        entityId: account.entityId,
                        entityName: account.entityName,
                    })
                ).length > 0
            ) {
                throw new BadRequestException(
                    "There is a item that have same entityGroup, entityName and entityId's. You delete to add new. you can update the old one if you wish too",
                );
            }
        }
    }

    @Post()
    async create(@Body() account: ItemDTO): Promise<ItemDTO> {
        // TODO: 2 tane aynı entityGroup - entityName - entityId değerlerine sahip olanlar geçmemeli
        await this.checkBeforAdd(account);
        return await this.accountService.add(account);
    }

    @Put(':itemId/price')
    async setPrice(
        @Param('itemId') itemId: string,
        @Body() priceDto: ItemPriceDTO,
    ): Promise<ItemPriceDTO> {
        priceDto.itemId = itemId;
        priceDto.activityOrder = 0;
        return await this.itemPriceService.setDefaultPrice(priceDto);
    }

    @Get(':itemId/price/default')
    async getDefaultPrice(
        @Param('itemId') itemId: string,
        @Query('variation') variation?: string,
        @Query('currency') currency = 'TRY',
        @Query('region') region = ItemPriceDefaults.REGION_ANY,
    ): Promise<ItemPriceDTO[]> {
        // throw new BadRequestException('Ğ');
        return await this.itemPriceService.allDefaultPrices({
            itemId,
            currency,
            variation,
            region,
        });
        // priceDto.itemId = itemId;
        // priceDto.activityOrder = 0;
        // return await this.itemPriceService.setDefaultPrice(priceDto);
    }

    @Get(':itemId/price/latest')
    async getLatestPrice(
        @Param('itemId') itemId: string,
        @Query('variation') variation?: string,
        @Query('currency') currency = 'TRY',
        @Query('region') region = ItemPriceDefaults.REGION_ANY,
    ): Promise<ItemPriceDTO[]> {
        return await this.itemPriceService.allLatestPrices({
            itemId,
            currency,
            region,
            variation,
        });

        // priceDto.itemId = itemId;
        // priceDto.activityOrder = 0;
        // return await this.itemPriceService.setDefaultPrice(priceDto);
    }

    @Put()
    async update(@Body() account: ItemDTO): Promise<ItemDTO> {
        return await this.accountService.edit(account);
    }

    @Delete(':id')
    async remove(@Param('id') id: string): Promise<void> {
        await await this.accountService.delete(id);
    }
}
