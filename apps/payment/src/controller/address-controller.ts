import {
    Body,
    Controller,
    Post,
    UnauthorizedException,
    UseGuards,
} from '@nestjs/common';
import { AccountAddressDto, AccountDTO, AddressSearchParamsDTO } from '@tk-postral/payment-common';
import {
    CurrentUser,
    EntityOwnershipService,
    JwtAuthGuard,
} from '@ubs-platform/users-microservice-helper';
import { UserAuthBackendDTO } from '@ubs-platform/users-common';
import { PostralConstants } from '../util/consts';
import { lastValueFrom } from 'rxjs';
import { BaseCrudControllerGenerator } from '@ubs-platform/crud-base';
import { Optional } from '@ubs-platform/crud-base-common/utils';
import { AddressService } from '../service/address.service';
import { Address } from '../entity/address.entity';

@Controller('address')
export class AddressController extends BaseCrudControllerGenerator<
    Address,
    string,
    AccountAddressDto,
    AccountAddressDto,
    AddressSearchParamsDTO
>({
    authorization: {
        ALL: { needsAuthenticated: true },
    },
}) {
    constructor(
        protected readonly service: AddressService,
        protected readonly eoClient: EntityOwnershipService,
    ) {
        super(service);
    }

    @Post('')
    @UseGuards(JwtAuthGuard)
    async add(
        @Body() body: AccountAddressDto,
        @CurrentUser() user?: UserAuthBackendDTO,
    ): Promise<AccountAddressDto> {
        const createdAccount = await this.service.create(body);
        // After creating the account, assign ownership to the user
        if (user) {
            const eo = await this.eoClient.insertOwnership({
                entityGroup: PostralConstants.ENTITY_GROUP_POSTRAL,
                entityName: PostralConstants.ENTITY_NAME_ADDRESS,
                entityId: createdAccount.id!,
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
        return createdAccount;
    }

    async checkUser(
        operation: 'ADD' | 'EDIT' | 'REMOVE' | 'GETALL' | 'GETID',
        user: Optional<UserAuthBackendDTO>,
        queriesAndPaths: Optional<{ [key: string]: any }>,
        body: Optional<AccountAddressDto>,
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
                entityName: PostralConstants.ENTITY_NAME_ADDRESS,
                ...((typeof id == 'string' && id) || id != null ? { entityId: id } : {}),
                ...(!id && (typeof queriesAndPaths?.entityOwnershipGroupId == "string" && queriesAndPaths?.entityOwnershipGroupId) ? { entityOwnershipGroupId: queriesAndPaths.entityOwnershipGroupId } : {}),
                userId: user.id,
                capabilityAtLeastOne,
            }),
        );
        if (!res) {
            throw new UnauthorizedException(
                `User does not have ownership for address ${id}`,
            );
        }
    }

    async manipulateSearch(
        user: Optional<UserAuthBackendDTO>,
        queriesAndPaths: Optional<AddressSearchParamsDTO>,
    ) {
        // Eğer kullanıcı admin değilse ve admin=true ile arama yapmaya çalışıyorsa hata fırlat
        if (!queriesAndPaths) {
            queriesAndPaths = {};
        }
        const isUserAdmin = user?.roles?.includes('ADMIN');
        const isAdminSearchMode = queriesAndPaths?.admin === 'true';
        // exec(
        //     `kdialog --msgbox "isUserAdmin: ${isUserAdmin}, isAdminSearchMode: ${isAdminSearchMode}"`,
        // );
        if (!isUserAdmin && isAdminSearchMode) {
            throw new UnauthorizedException(
                'Only admins can search with admin=true',
            );
        }

        // Eğer kullanıcı admin değilse ve entityOwnershipGroupId verilmemişse, kendi userId'sini ekle
        if (!isAdminSearchMode && !queriesAndPaths?.entityOwnershipGroupId) {
            queriesAndPaths.ownerUserId = user?.id;
        }

        return queriesAndPaths;
    }
}
