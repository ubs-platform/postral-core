import {
    Controller,
    BadRequestException,
    UnauthorizedException,
} from '@nestjs/common';
import { AccountService } from '../service/account.service';
import { AccountDTO, AccountSearchParamsDTO } from '@tk-postral/payment-common';
import {
    CurrentUser,
} from '@ubs-platform/users-microservice-helper';
import { UserAuthBackendDTO } from '@ubs-platform/users-common';
import { PostralConstants } from '../util/consts';
import { BaseCrudController, CrudControllerConfig } from '@ubs-platform/crud-base';
import { Account } from '@tk-postral/postral-entities';
import { Optional } from '@ubs-platform/crud-base-common/utils';
import { AuthUtilService } from '../service/auth-util.service';

@Controller('account')
@CrudControllerConfig({ authorization: { ALL: { needsAuthenticated: true } } })
export class AccountNewController extends BaseCrudController<
    Account,
    String,
    AccountDTO,
    AccountDTO,
    AccountSearchParamsDTO
> {
    constructor(
        protected readonly service: AccountService,
        protected readonly authUtilService: AuthUtilService,
    ) {
        super(service);
    }

    async checkUser(
        operation: 'ADD' | 'EDIT' | 'REMOVE' | 'GETALL' | 'GETID',
        user: Optional<UserAuthBackendDTO>,
        queriesAndPaths: Optional<{ [key: string]: any }>,
        body: Optional<AccountDTO>,
    ): Promise<void> {
        if (operation === "ADD" && body?.type === 'INDIVIDUAL' && body.entityOwnershipGroupId) {
            throw new BadRequestException('Individual accounts cannot have an entity ownership group ID.');
        }

        if (
            operation === 'ADD' &&
            body?.isExternal &&
            body.entityOwnershipGroupId
        ) {
            throw new BadRequestException(
                'External accounts cannot be assigned an ownership group.',
            );
        }

        if (
            operation === 'ADD' &&
            body?.isExternal &&
            !user?.roles?.includes('ADMIN')
        ) {
            throw new UnauthorizedException(
                'Only admins can create external accounts.',
            );
        }

        if (operation === 'EDIT' && body?.id) {
            const current = await this.service.findAccountForAuthorization(body.id);
            if (
                body.isExternal !== undefined &&
                body.isExternal !== current.isExternal
            ) {
                throw new BadRequestException('An account external status cannot be changed after creation.');
            }
            if (current.isExternal && !user?.roles?.includes('ADMIN')) {
                throw new UnauthorizedException('Only admins can edit external accounts.');
            }
            if (!current.isExternal) {
                await this.authUtilService.checkUserEntityOwnership(
                    operation,
                    user,
                    queriesAndPaths,
                    body,
                    PostralConstants.ENTITY_NAME_ACCOUNT,
                    'account',
                );
            }
            return;
        }

        if (operation === 'GETID' || operation === 'REMOVE') {
            const account = await this.service.findAccountForAuthorization(
                queriesAndPaths?.id,
            );
            if (account.isExternal) {
                if (!user?.roles?.includes('ADMIN')) {
                    throw new UnauthorizedException('Only admins can access external accounts.');
                }
                return;
            }
            await this.authUtilService.checkUserEntityOwnership(
                operation,
                user,
                queriesAndPaths,
                body,
                PostralConstants.ENTITY_NAME_ACCOUNT,
                'account',
            );
            return;
        }

        return await this.authUtilService.checkUserEntityOwnership(
            operation,
            user,
            queriesAndPaths,
            body,
            PostralConstants.ENTITY_NAME_ACCOUNT,
            'account',
        );
    }

    async manipulateSearch(
        user: Optional<UserAuthBackendDTO>,
        queriesAndPaths: Optional<AccountSearchParamsDTO>,
    ) {
        const manipulatedQueries = queriesAndPaths || {};

        if (manipulatedQueries.deactivated === undefined) {
            manipulatedQueries.deactivated = 'NOT_DEACTIVATED';
        }

        return this.authUtilService.manipulateSearchOwnership(
            user,
            manipulatedQueries,
        );
    }
}
