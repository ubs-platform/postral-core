import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { In, Like, Repository } from 'typeorm';
import {
    ItemAddDTO,
    ItemDTO,
    ItemEditDTO,
    ItemSearchDTO,
} from '@tk-postral/payment-common';
import { Account } from '../entity/account.entity';
import { Item } from '../entity/item.entity';
import { ItemMapper } from '../mapper/item.mapper';
import { ItemPriceService } from './item-price.service';
import { UserAuthBackendDTO } from '@ubs-platform/users-common';
import { PostralConstants } from '../util/consts';
import { BaseCrudService } from '@ubs-platform/crud-base';
import { Optional } from '@ubs-platform/crud-base-common/utils';
import { EntityOwnershipService } from '@ubs-platform/users-microservice-helper';
import { lastValueFrom } from 'rxjs';
import { TypeormRepositoryWrap } from './base/typeorm-repository-wrap';

@Injectable()
export class ItemCrudService extends BaseCrudService<
    Item,
    string,
    ItemAddDTO,
    ItemDTO,
    ItemSearchDTO
> {
    constructor(
        @InjectRepository(Item)
        public repo: Repository<Item>,
        private readonly itemMapper: ItemMapper,
        private eoService: EntityOwnershipService,
    ) {
        super(new TypeormRepositoryWrap<Item, string>(repo));
    }

    getIdFieldNameFromInput(i: ItemDTO): string {
        return i.id!;
    }

    getIdFieldNameFromModel(i: Item): string {
        return i.id;
    }

    generateNewModel(): Item {
        return new Item();
    }
    toOutput(m: Item): Promise<ItemDTO> | ItemDTO {
        return this.itemMapper.toDto(m);
    }
    moveIntoModel(model: Item, i: ItemDTO): Promise<Item> | Item {
        return this.itemMapper.updateEntity(model, i);
    }

    async searchParams(
        s?: Partial<ItemSearchDTO>,
        u?: UserAuthBackendDTO,
    ): Promise<any> {
        if (!u) {
            throw new Error('User information is required for search');
        }
        let ids: Optional<string[]> = null;
        if (s?.searchForCurrentUserEntities === 'true') {
            ids = await lastValueFrom(
                this.eoService.searchOwnershipEntityIdsByUser({
                    entityGroup: PostralConstants.ENTITY_GROUP_POSTRAL,
                    entityName: PostralConstants.ENTITY_NAME_ITEM,

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
            where.id = In(ids);
        }
        // exec(`kdialog --msgbox "${JSON.stringify(ids)}"`);

        return where;
    }
}
