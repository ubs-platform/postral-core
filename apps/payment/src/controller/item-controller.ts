import {
    Controller,
    Get,
    Post,
    Put,
    Delete,
    Param,
    Body,
    UseGuards,
    NotFoundException,
    UnauthorizedException,
    Query,
} from '@nestjs/common';
import { AccountService } from '../service/account.service';
import { AccountDTO, AccountSearchParamsDTO, ItemAddDTO, ItemDTO, ItemEditDTO, ItemPriceDTO, ItemSearchDTO } from '@tk-postral/payment-common';
import {
    CurrentUser,
    EntityOwnershipGroupClientService,
    EntityOwnershipService,
    JwtAuthGuard,
} from '@ubs-platform/users-microservice-helper';
import { UserAuthBackendDTO } from '@ubs-platform/users-common';
import { PostralConstants } from '../util/consts';
import { identity, lastValueFrom } from 'rxjs';
import { BaseCrudControllerGenerator } from '@ubs-platform/crud-base';
import { Account } from '../entity';
import { Optional } from '@ubs-platform/crud-base-common/utils';
import { Item } from '../entity/item.entity';
import { ItemCrudService } from '../service/item-crud.service';
import { ItemPriceService } from '../service/item-price.service';

@Controller('item')
export class ItemController extends BaseCrudControllerGenerator<
    Item,
    String,
    ItemAddDTO,
    ItemDTO,
    ItemSearchDTO
>({
    authorization: {
        ALL: { needsAuthenticated: true },
    },
}) {
    constructor(
        protected readonly service: ItemCrudService,
        protected readonly eoClient: EntityOwnershipService,
        protected readonly pricesService: ItemPriceService
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
        const createdItem = await this.service.create(body);
        // After creating the item, assign ownership to the user
        if (user) {
            const eo = await this.eoClient.insertOwnership({
                entityGroup: PostralConstants.ENTITY_GROUP_POSTRAL,
                entityName: PostralConstants.ENTITY_NAME_ITEM,
                entityId: createdItem.id,
                overriderRoles: ['ADMIN'],
                ...(!body.entityOwnershipGroupId
                    ? {
                          userCapabilities: [
                              { userId: user.id, capability: 'OWNER' },
                          ],
                      }
                    : { userCapabilities: [] }),
                ...(body.entityOwnershipGroupId
                    ? { entityOwnershipGroupId: body.entityOwnershipGroupId }
                    : { entityOwnershipGroupId: '' }),
            });
        }
        return createdItem;
    }

    async checkUser(
        operation: 'ADD' | 'EDIT' | 'REMOVE' | 'GETALL' | 'GETID',
        user: Optional<UserAuthBackendDTO>,
        queriesAndPaths: Optional<{ [key: string]: any }>,
        body: Optional<ItemDTO | ItemEditDTO | ItemAddDTO>,
    ): Promise<void> {
        let id = '';
        let capabilityAtLeastOne = ['OWNER', 'EDITOR', 'VIEWER'];
        if (operation !== 'GETALL' && operation !== 'GETID') {
            capabilityAtLeastOne = ['OWNER', 'EDITOR'];
        }
        if (operation === 'ADD' || operation === 'EDIT') {
            id = body?.id || '';
        } else if (operation === 'REMOVE' || operation === 'GETID') {
            id = queriesAndPaths?.id || '';
        }
        if (id == '' || !user) {
            return Promise.resolve();
        }

        const res = await lastValueFrom(
            this.eoClient.hasOwnership({
                entityGroup: PostralConstants.ENTITY_GROUP_POSTRAL,
                entityName: PostralConstants.ENTITY_NAME_ITEM,
                ...((typeof id == 'string' && id) || id != null ? { entityId: id } : {}),
                ...(!id && (typeof queriesAndPaths?.entityOwnershipGroupId == "string" && queriesAndPaths?.entityOwnershipGroupId) ? { entityOwnershipGroupId: queriesAndPaths.entityOwnershipGroupId } : {}),
                userId: user.id,
                capabilityAtLeastOne,
            }),
        );
        if (!res) {
            throw new UnauthorizedException(
                `User does not have ownership for account ${id}`,
            );
        }
    }

    async manipulateSearch(
        user: Optional<UserAuthBackendDTO>,
        queriesAndPaths: Optional<ItemSearchDTO>,
    ) {
        // Eğer kullanıcı admin değilse ve admin=true ile arama yapmaya çalışıyorsa hata fırlat
        // if (!queriesAndPaths) {
        //     queriesAndPaths = {};
        // }
        // const isUserAdmin = user?.roles?.includes('ADMIN');
        // const isAdminSearchMode = queriesAndPaths?.admin === 'true';
        // exec(
        //     `kdialog --msgbox "isUserAdmin: ${isUserAdmin}, isAdminSearchMode: ${isAdminSearchMode}"`,
        // );
        // if (!isUserAdmin && isAdminSearchMode) {
        //     throw new UnauthorizedException(
        //         'Only admins can search with admin=true',
        //     );
        // }

        // Eğer kullanıcı admin değilse ve entityOwnershipGroupId verilmemişse, kendi userId'sini ekle
        // if (!isAdminSearchMode && !queriesAndPaths?.entityOwnershipGroupId) {
        //     queriesAndPaths.ownerUserId = user?.id;
        // }

        return queriesAndPaths;
    }
}
