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
import { AccountDTO, AccountSearchParamsDTO } from '@tk-postral/payment-common';
import {
    CurrentUser,
    EntityOwnershipGroupClientService,
    EntityOwnershipService,
    JwtAuthGuard,
} from '@ubs-platform/users-microservice-helper';
import { UserAuthBackendDTO } from '@ubs-platform/users-common';
import { PostralConstants } from '../util/consts';
import { lastValueFrom } from 'rxjs';
import { BaseCrudControllerGenerator } from '@ubs-platform/crud-base';
import { Account } from '../entity';
import { Optional } from '@ubs-platform/crud-base-common/utils';

@Controller('account')
export class AccountNewController extends BaseCrudControllerGenerator<
    Account,
    String,
    AccountDTO,
    AccountDTO,
    AccountSearchParamsDTO
>({
    authorization: {
        ALL: { needsAuthenticated: true },
    },
}) {
    constructor(
        protected readonly service: AccountService,
        protected readonly eoClient: EntityOwnershipService,
    ) {
        super(service);
    }

    @Post('')
    @UseGuards(JwtAuthGuard)
    async add(
        @Body() body: AccountDTO,
        @CurrentUser() user?: UserAuthBackendDTO,
    ): Promise<AccountDTO> {
        const createdAccount = await this.service.create(body);
        // After creating the account, assign ownership to the user
        if (user) {
            const eo = await this.eoClient.insertOwnership({
                entityGroup: PostralConstants.ENTITY_GROUP_POSTRAL,
                entityName: PostralConstants.ENTITY_NAME_ACCOUNT,
                entityId: createdAccount.id,
                overriderRoles: ['ADMIN'],
                ...(user
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

    // @Get('')
    // @UseGuards(JwtAuthGuard)
    // override async fetchAll(
    //     @Query() s?: AccountSearchParamsDTO | undefined,
    //     @CurrentUser() user?: UserAuthBackendDTO,
    // ): Promise<AccountDTO[]> {
    //     await this.manipulateSearch(user, s);
    //     return super.fetchAll(s, user);
    // }

    async checkUser(
        operation: 'ADD' | 'EDIT' | 'REMOVE' | 'GETALL' | 'GETID',
        user: Optional<UserAuthBackendDTO>,
        queriesAndPaths: Optional<{ [key: string]: any }>,
        body: Optional<AccountDTO>,
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
                entityName: PostralConstants.ENTITY_NAME_ACCOUNT,
                entityId: id,
                userId: user.id,
                capabilityAtLeastOne
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
        queriesAndPaths: Optional<AccountSearchParamsDTO>,
    ) {
        // Eğer kullanıcı admin değilse ve admin=true ile arama yapmaya çalışıyorsa hata fırlat
        if (queriesAndPaths == null) {
            queriesAndPaths = {};
        }
        const isUserAdmin = user?.roles?.includes('ADMIN');
        const isAdminSearchMode = queriesAndPaths?.admin === 'true';
        if (!isUserAdmin && isAdminSearchMode) {
            throw new UnauthorizedException(
                'Only admins can search with admin=true',
            );
        }

        // Eğer kullanıcı admin değilse ve entityOwnershipGroupId verilmemişse, kendi userId'sini ekle
        if (!isAdminSearchMode && !queriesAndPaths?.entityOwnershipGroupId) {
            queriesAndPaths.ownerUserId = user?.id;
        } else if (
            !isAdminSearchMode &&
            queriesAndPaths?.entityOwnershipGroupId
        ) {
            return queriesAndPaths;
        }
    }
}
