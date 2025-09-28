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
} from '@nestjs/common';
import { AccountService } from '../service/account.service';
import { AccountDTO } from '@tk-postral/payment-common';
import {
    CurrentUser,
    EntityOwnershipService,
    JwtAuthGuard,
} from '@ubs-platform/users-microservice-helper';
import { UserAuthBackendDTO } from '@ubs-platform/users-common';
import { PostralConstants } from '../util/consts';
import { lastValueFrom } from 'rxjs';

@Controller('current-user/account')
@UseGuards(JwtAuthGuard)
export class AccountUserController {
    constructor(
        private readonly accountService: AccountService,
        private oeFrontcuAyhan: EntityOwnershipService,
    ) {}

    @Get()
    async findAll(
        @CurrentUser() currentUser: UserAuthBackendDTO,
    ): Promise<AccountDTO[]> {
        // TODO: Roles and entity ownerships

        // if (currentUser.roles.includes('ADMIN')) {
        //     return this.accountService.fetchAll();
        // } else {
        // const a = await lastValueFrom(
        //     this.oeFrontcuAyhan.searchOwnershipUser({
        //         entityGroup: PostralConstants.ENTITY_GROUP_POSTRAL,
        //         entityName: PostralConstants.ENTITY_NAME_ACCOUNT,
        //         userId: currentUser.id,
        //     }),
        // );
        //     if (a.length) {
        //     }
        // }
        return this.accountService.fetchAll();
        // admin ise tümü, değilse kendi oluşturdukları vs
    }

    @Get(':id')
    async findOne(
        @Param('id') id: string,
        @CurrentUser() currentUser: UserAuthBackendDTO,
    ): Promise<AccountDTO> {
        const a = await lastValueFrom(
            this.oeFrontcuAyhan.searchOwnership({
                entityGroup: PostralConstants.ENTITY_GROUP_POSTRAL,
                entityName: PostralConstants.ENTITY_NAME_ACCOUNT,
                entityId: id,
            }),
        );

        if (
            currentUser.roles.includes('ADMIN') ||
            a[0]?.userCapabilities.find((a) => a.userId == currentUser.id)
        ) {
            return this.accountService.fetchOne(id);
        }
        throw new NotFoundException();
        // admin ise tümü, değilse kendi oluşturdukları vs
    }

    @Post()
    async create(
        @Body() account: AccountDTO,
        @CurrentUser() currentUser: UserAuthBackendDTO,
    ): Promise<AccountDTO> {
        return await this.accountService.add(account);
    }

    @Put()
    async update(
        @Body() account: AccountDTO,
        @CurrentUser() currentUser: UserAuthBackendDTO,
    ): Promise<AccountDTO> {
        return await this.accountService.edit(account);
    }

    @Delete(':id')
    async remove(
        @Param('id') id: string,
        @CurrentUser() currentUser: UserAuthBackendDTO,
    ): Promise<void> {
        await this.accountService.delete(id);
    }
}
