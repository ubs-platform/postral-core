import {
    Controller,
} from '@nestjs/common';
import { AccountSearchParamsDTO, ItemTaxDTO, ItemTaxSearchDTO } from '@tk-postral/payment-common';
import {
    CurrentUser,
} from '@ubs-platform/users-microservice-helper';
import { UserAuthBackendDTO } from '@ubs-platform/users-common';
import { PostralConstants } from '../util/consts';
import { BaseCrudControllerGenerator } from '@ubs-platform/crud-base';
import { ItemTaxEntity } from '../entity';
import { Optional } from '@ubs-platform/crud-base-common/utils';
import { ItemTaxService } from '../service/item-tax.service';
import { AuthUtilService } from '../service/auth-util.service';

@Controller('item-tax')
export class ItemTaxController extends BaseCrudControllerGenerator<
    ItemTaxEntity,
    String,
    ItemTaxDTO,
    ItemTaxDTO,
    ItemTaxSearchDTO
>({
    authorization: {
        ALL: { needsAuthenticated: true },
    },
}) {
    constructor(
        protected readonly service: ItemTaxService,
        protected readonly authUtilService: AuthUtilService,
    ) {
        super(service);
    }

    async checkUser(
        operation: 'ADD' | 'EDIT' | 'REMOVE' | 'GETALL' | 'GETID',
        user: Optional<UserAuthBackendDTO>,
        queriesAndPaths: Optional<{ [key: string]: any }>,
        body: Optional<ItemTaxDTO>,
    ): Promise<void> {
        return await this.authUtilService.checkUserEntityOwnership(
            operation,
            user,
            queriesAndPaths,
            body,
            PostralConstants.ENTITY_NAME_TAX,
            'tax',
        );
    }

    async manipulateSearch(
        user: Optional<UserAuthBackendDTO>,
        queriesAndPaths: Optional<AccountSearchParamsDTO>,
    ) {
        return this.authUtilService.manipulateSearchOwnership(
            user,
            queriesAndPaths,
        );
    }
}
