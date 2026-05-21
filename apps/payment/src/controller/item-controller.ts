import {
    Controller,
    Get,
    Post,
    Delete,
    Param,
    Body,
    UseGuards,
    NotFoundException,
    UnauthorizedException,
} from '@nestjs/common';
import {
    ItemAddDTO,
    ItemDTO,
    ItemEditDTO,
    ItemPriceDTO,
    ItemSearchDTO,
} from '@tk-postral/payment-common';
import {
    CurrentUser,
    EntityOwnershipService,
    JwtAuthGuard,
} from '@ubs-platform/users-microservice-helper';
import { UserAuthBackendDTO } from '@ubs-platform/users-common';
import { PostralConstants } from '../util/consts';
import { lastValueFrom } from 'rxjs';
import { BaseCrudController, CrudControllerConfig } from '@ubs-platform/crud-base';
import { Item } from '@tk-postral/postral-entities';
import { Optional } from '@ubs-platform/crud-base-common/utils';

import { ItemCrudService } from '../service/item-crud.service';
import { ItemPriceService } from '../service/item-price.service';
import { AuthUtilService } from '../service/auth-util.service';

@Controller('item')
@CrudControllerConfig({ authorization: { ALL: { needsAuthenticated: true } } })
export class ItemController extends BaseCrudController<
    Item,
    String,
    ItemAddDTO,
    ItemDTO,
    ItemSearchDTO
> {
    constructor(
        protected readonly service: ItemCrudService,
        protected readonly eoClient: EntityOwnershipService,
        protected readonly pricesService: ItemPriceService,
        protected readonly authutil: AuthUtilService,
    ) {
        super(service);
    }

    @Delete(':id/prices/:priceId')
    @UseGuards(JwtAuthGuard)
    async deletePrice(
        @Param('id') itemId: string,
        @Param('priceId') priceId: string,
        @CurrentUser() user?: UserAuthBackendDTO,
    ): Promise<void> {
        // await this.checkUser('REMOVE', user, { id: priceId }, undefined);
        await this.pricesService.deletePrice(itemId, priceId);
    }

    @Get(':id/prices/default')
    @UseGuards(JwtAuthGuard)
    async getDefaultPrices(
        @Param('id') id: string,
        @CurrentUser() user?: UserAuthBackendDTO,
    ): Promise<ItemPriceDTO[]> {
        await this.checkUser('GETID', user, { id }, undefined);
        const item = await this.pricesService.allDefaultPrices({ itemId: id });
        if (!item) {
            throw new NotFoundException(`Item with id ${id} not found`);
        }
        return item;
    }

    @Get(':id/prices/latest')
    @UseGuards(JwtAuthGuard)
    async getLatestPrices(
        @Param('id') id: string,
        @CurrentUser() user?: UserAuthBackendDTO,
    ): Promise<ItemPriceDTO[]> {
        // await this.checkUser('GETID', user, { id }, undefined);
        const item = await this.pricesService.allLatestPrices({ itemId: id });
        if (!item) {
            throw new NotFoundException(`Item with id ${id} not found`);
        }
        return item;
    }

    @Post(':id/prices/default')
    @UseGuards(JwtAuthGuard)
    async addDefaultPrice(
        @Param('id') id: string,
        @Body() body: ItemPriceDTO,
        @CurrentUser() user?: UserAuthBackendDTO,
    ): Promise<ItemPriceDTO> {
        body.itemId = id;

        // await this.checkUser('ADD', user, { id }, body);
        const createdPrice = await this.pricesService.setDefaultPrice(body);
        return createdPrice;
    }

    @Post('')
    @UseGuards(JwtAuthGuard)
    async add(
        @Body() body: ItemAddDTO,
        @CurrentUser() user?: UserAuthBackendDTO,
    ): Promise<ItemDTO> {
        const createdItem = await this.service.create(body, user);

        return createdItem;
    }

    async checkUser(
        operation: 'ADD' | 'EDIT' | 'REMOVE' | 'GETALL' | 'GETID',
        user: Optional<UserAuthBackendDTO>,
        queriesAndPaths: Optional<{ [key: string]: any }>,
        body: Optional<ItemDTO | ItemEditDTO | ItemAddDTO>,
    ): Promise<void> {
        const accountId = queriesAndPaths?.accountId || body?.sellerAccountId;
        // ITEM yerine ACCOUNT kontrolü yapılacak, çünkü çok fazla item olduğu zaman ownership kontrolü aşırı zorlaşacak.
        return await this.authutil.checkUserEntityOwnership(
            operation,
            user,
            queriesAndPaths,
            { id: accountId },
            PostralConstants.ENTITY_NAME_ACCOUNT,
            'tax',
        );
    }

    async manipulateSearch(
        user: Optional<UserAuthBackendDTO>,
        queriesAndPaths: Optional<ItemSearchDTO>,
    ) {

        return queriesAndPaths;
    }
}
