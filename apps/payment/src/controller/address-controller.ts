import {
    Controller,
} from '@nestjs/common';
import { AccountAddressDto, AddressSearchParamsDTO } from '@tk-postral/payment-common';
import {
    CurrentUser,
} from '@ubs-platform/users-microservice-helper';
import { UserAuthBackendDTO } from '@ubs-platform/users-common';
import { PostralConstants } from '../util/consts';
import { BaseCrudController, CrudControllerConfig } from '@ubs-platform/crud-base';
import { Optional } from '@ubs-platform/crud-base-common/utils';
import { AddressService } from '../service/address.service';
import { Address } from '@tk-postral/postral-entities';
import { AuthUtilService } from '../service/auth-util.service';

@Controller('address')
@CrudControllerConfig({ authorization: { ALL: { needsAuthenticated: true } } })
export class AddressController extends BaseCrudController<
    Address,
    string,
    AccountAddressDto,
    AccountAddressDto,
    AddressSearchParamsDTO
> {
    constructor(
        protected readonly service: AddressService,
        protected readonly authUtilService: AuthUtilService,
    ) {
        super(service);
    }

    async checkUser(
        operation: 'ADD' | 'EDIT' | 'REMOVE' | 'GETALL' | 'GETID',
        user: Optional<UserAuthBackendDTO>,
        queriesAndPaths: Optional<{ [key: string]: any }>,
        body: Optional<AccountAddressDto>,
    ): Promise<void> {
        return await this.authUtilService.checkUserEntityOwnership(
            operation,
            user,
            queriesAndPaths,
            body,
            PostralConstants.ENTITY_NAME_ADDRESS,
            'address',
        );
    }

    async manipulateSearch(
        user: Optional<UserAuthBackendDTO>,
        queriesAndPaths: Optional<AddressSearchParamsDTO>,
    ) {
        return this.authUtilService.manipulateSearchOwnership(
            user,
            queriesAndPaths,
        );
    }
}
