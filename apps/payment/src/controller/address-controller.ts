import {
    Controller,
    UnauthorizedException,
} from '@nestjs/common';
import { AddressDto, AddressSearchParamsDTO } from '@tk-postral/payment-common';
import {
    EntityOwnershipService,
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
    AddressDto,
    AddressDto,
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



    async checkUser(
        operation: 'ADD' | 'EDIT' | 'REMOVE' | 'GETALL' | 'GETID',
        user: Optional<UserAuthBackendDTO>,
        queriesAndPaths: Optional<{ [key: string]: any }>,
        body: Optional<AddressDto>,
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
                entityId: id,
                userId: user.id,
                capabilityAtLeastOne
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
