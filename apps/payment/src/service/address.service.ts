import { Injectable } from '@nestjs/common';
import { Account } from '../entity';
import { AccountDTO, AccountSearchParamsDTO, AccountAddressDto, AddressSearchParamsDTO } from '@tk-postral/payment-common';
import { InjectRepository } from '@nestjs/typeorm';
import { ArrayContains, In, Like, Repository } from 'typeorm';
import { AccountMapper } from '../mapper/account.mapper';
import { BaseCrudService } from '@ubs-platform/crud-base';
import { TypeormRepositoryWrap } from './base/typeorm-repository-wrap';
import { UserAuthBackendDTO } from '@ubs-platform/users-common';
import { EntityOwnershipService } from '@ubs-platform/users-microservice-helper';
import { PostralConstants } from '../util/consts';
import { lastValueFrom } from 'rxjs';
import { Optional } from '@ubs-platform/crud-base-common/utils';
import { Address } from '../entity/address.entity';
import { AddressMapper } from '../mapper/address.mapper';
import { exec } from 'child_process';
import { AuthUtilService } from './auth-util.service';

@Injectable()
export class AddressService extends BaseCrudService<
    Address,
    string,
    AccountAddressDto,
    AccountAddressDto,
    AddressSearchParamsDTO
> {
    constructor(
        @InjectRepository(Address)
        public repo: Repository<Address>,
        private readonly addressMapper: AddressMapper,
        private eoService: EntityOwnershipService,
        private authUtilService: AuthUtilService,
    ) {
        super(new TypeormRepositoryWrap<Address, string>(repo));
    }

    async afterCreate(m: AccountAddressDto, input: AccountAddressDto, user?: UserAuthBackendDTO): Promise<void> {
        return await this.authUtilService.afterCreate(
            PostralConstants.ENTITY_GROUP_POSTRAL,
            PostralConstants.ENTITY_NAME_ADDRESS,
            m.id!,
            user?.id || '',
            input.entityOwnershipGroupId,
        );
    }

    getIdFieldNameFromInput(i: AccountAddressDto): string {
        return i.id!;
    }

    getIdFieldNameFromModel(i: Address): string {
        return i.id;
    }

    generateNewModel(): Address {
        return new Address();
    }
    toOutput(m: Address): Promise<AccountAddressDto> | AccountAddressDto {
        return this.addressMapper.toDto(m);
    }
    moveIntoModel(model: Address, i: AccountAddressDto): Promise<Address> | Address {
        return this.addressMapper.updateEntity(model, i);
    }

    async searchParams(
        s?: Partial<AddressSearchParamsDTO>,
        u?: UserAuthBackendDTO,
    ): Promise<any> {
        if (!u) {
            throw new Error('User information is required for search');
        }
        let ids: Optional<string[]> = null;
        if (s?.admin !== 'true') {
            ids = await this.authUtilService.searchOwnedIds(
                PostralConstants.ENTITY_NAME_ADDRESS,
                ['OWNER', 'EDITOR', 'VIEWER'],
                (s?.entityOwnershipGroupId != null
                        ? { ownershipGroupId: s.entityOwnershipGroupId }
                        : { userId: u!.id })
            );

        }

        const where: any = {};
        if (s?.name) {
            where.name = Like(`%${s.name}%`);
        }
        if (ids != null) {
            where.id = In(ids.length > 0 ? ids : ['']);
        }
        // exec(`kdialog --msgbox "${JSON.stringify(ids)}"`);

        return where;
    }
}
