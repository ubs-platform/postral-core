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
    ) {
        super(new TypeormRepositoryWrap<Address, string>(repo));
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
        if (s?.admin !== 'true' && s?.entityOwnershipGroupId == null) {
            ids = await lastValueFrom(
                this.eoService.searchOwnershipEntityIdsByUser({
                    entityGroup: PostralConstants.ENTITY_GROUP_POSTRAL,
                    entityName: PostralConstants.ENTITY_NAME_ADDRESS,

                    capabilityAtLeastOne: ['OWNER', 'EDITOR', 'VIEWER'],
                    ...(s?.entityOwnershipGroupId != null
                        ? { entityOwnershipGroupId: s.entityOwnershipGroupId }
                        : { userId: u!.id }),
                }),
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
