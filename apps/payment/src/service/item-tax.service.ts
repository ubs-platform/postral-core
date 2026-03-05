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
import { AuthUtilService } from './auth-util.service';

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
        private authUtilService: AuthUtilService,
    ) {
        super(new TypeormRepositoryWrap<ItemTaxEntity, string>(repo, ["variations"]));
    }

    async afterCreate(m: ItemTaxDTO, input: ItemTaxDTO, user?: UserAuthBackendDTO): Promise<void> {
        await this.authUtilService.afterCreate(
            PostralConstants.ENTITY_GROUP_POSTRAL,
            PostralConstants.ENTITY_NAME_TAX,
            m.id!,
            user?.id,
            input.entityOwnershipGroupId,
        );
        return Promise.resolve();
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
        const orClauses: any[] = [];

        if (!u) {
            throw new Error('User information is required for search');
        }
        let ids: Optional<string[]> = null;
        if (s?.admin === 'true') {
            orClauses.push({});
        }

        if (s?.admin !== 'true' && (s?.visibility === 'PUBLIC' || s?.visibility === 'NONE' || s?.visibility === undefined)) {
            orClauses.push({ isPublic: true });
        }
        if (s?.admin !== 'true' && (s?.visibility === 'PRIVATE' || s?.visibility === 'NONE' || s?.visibility === undefined) && u) {
            const ids = await lastValueFrom(
                this.eoService.searchOwnershipEntityIdsByUser({
                    entityGroup: PostralConstants.ENTITY_GROUP_POSTRAL,
                    entityName: PostralConstants.ENTITY_NAME_TAX,

                    capabilityAtLeastOne: ['OWNER', 'EDITOR', 'VIEWER'],
                    ...(s?.entityOwnershipGroupId != null
                        ? { entityOwnershipGroupId: s.entityOwnershipGroupId }
                        : { userId: u!.id }),
                }),
            );
            orClauses.push({ id: In(ids.length > 0 ? ids : ['']) });
        }

        const where: any = {};
        if (s?.taxName) {
            where.taxName = Like(`%${s.taxName}%`);
        }

        return orClauses.map(clause => ({ ...where, ...clause }));
    }
}
