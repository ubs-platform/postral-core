import {
    Controller,
} from '@nestjs/common';
import { AccountService } from '../service/account.service';
import { AccountDTO, AccountSearchParamsDTO } from '@tk-postral/payment-common';
import {
    CurrentUser,
} from '@ubs-platform/users-microservice-helper';
import { UserAuthBackendDTO } from '@ubs-platform/users-common';
import { PostralConstants } from '../util/consts';
import { BaseCrudController, CrudControllerConfig } from '@ubs-platform/crud-base';
import { Account } from '../entity';
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
