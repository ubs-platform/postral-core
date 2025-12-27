import { Injectable } from '@nestjs/common';
import { AddressSearchParamsDTO, ItemTaxDTO, ItemTaxSearchDTO } from '@tk-postral/payment-common';
import { BaseCrudService } from '@ubs-platform/crud-base';
import { ItemTaxEntity } from '../entity';
import { TypeormRepositoryWrap } from './base/typeorm-repository-wrap';
import { InjectRepository } from '@nestjs/typeorm';
import { EntityOwnershipService } from '@ubs-platform/users-microservice-helper';
import { In, Like, Repository } from 'typeorm';
import { ItemTaxMapper } from '../mapper/item-tax.mapper';
import { UserAuthBackendDTO } from '@ubs-platform/users-common';
import { FilterQuery } from 'mongoose';
import { Optional } from '@ubs-platform/crud-base-common/utils';
import { lastValueFrom } from 'rxjs';
import { PostralConstants } from '../util/consts';

@Injectable()
export class ItemTaxService extends BaseCrudService<
    ItemTaxEntity,
    string,
    ItemTaxDTO,
    ItemTaxDTO,
    ItemTaxDTO
> {
    constructor(
        @InjectRepository(ItemTaxEntity)
        public repo: Repository<ItemTaxEntity>,
        private readonly itemTaxMapper: ItemTaxMapper,
        private eoService: EntityOwnershipService,
    ) {
        super(new TypeormRepositoryWrap<ItemTaxEntity, string>(repo, ["variations"]));
    }

    generateNewModel(): ItemTaxEntity {
        return new ItemTaxEntity();
    }

    getIdFieldNameFromInput(i: ItemTaxDTO): string {
        return i.id;
    }

    getIdFieldNameFromModel(i: ItemTaxEntity): string {
        return i.id;
    }

    toOutput(m: ItemTaxEntity): ItemTaxDTO | Promise<ItemTaxDTO> {
        return this.itemTaxMapper.toDTO(m);
    }

    moveIntoModel(
        model: ItemTaxEntity,
        i: ItemTaxDTO,
    ): ItemTaxEntity | Promise<ItemTaxEntity> {
        return this.itemTaxMapper.updateEntity(model, i);
    }


    async searchParams(
        s?: Partial<ItemTaxSearchDTO>,
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
                    entityName: PostralConstants.ENTITY_NAME_TAX,

                    capabilityAtLeastOne: ['OWNER', 'EDITOR', 'VIEWER'],
                    ...(s?.entityOwnershipGroupId != null
                        ? { entityOwnershipGroupId: s.entityOwnershipGroupId }
                        : { userId: u!.id }),
                }),
            );
        }

        const where: any = {};
        if (s?.taxName) {
            where.taxName = Like(`%${s.taxName}%`);
        }
        if (ids != null) {
            where.id = In(ids.length > 0 ? ids : ['']);
        }
        // exec(`kdialog --msgbox "${JSON.stringify(ids)}"`);

        return where;
    }
}
