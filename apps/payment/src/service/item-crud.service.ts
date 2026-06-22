import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { In, Like, Repository } from 'typeorm';
import {
    ItemAddDTO,
    ItemDTO,
    ItemEditDTO,
    ItemSearchDTO,
} from '@tk-postral/payment-common';
import { Account, Item } from '@tk-postral/postral-entities';
import { ItemMapper } from '../mapper/item.mapper';
import { ItemPriceService } from './item-price.service';
import { UserAuthBackendDTO } from '@ubs-platform/users-common';
import { PostralConstants } from '../util/consts';
import { BaseCrudService } from '@ubs-platform/crud-base';
import { Optional } from '@ubs-platform/crud-base-common/utils';
import { EntityOwnershipService } from '@ubs-platform/users-microservice-helper';
import { lastValueFrom } from 'rxjs';
import { TypeormRepositoryWrap } from './base/typeorm-repository-wrap';
import { AuthUtilService } from './auth-util.service';
import { exec } from 'child_process';

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
        private authUtilService: AuthUtilService,
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
        // exec(`kdialog --msgbox "searchParams called with search: ${JSON.stringify(s)} and user: ${JSON.stringify(u)}" 10 50`);
        if (!u) {
            throw new Error('User information is required for search');
        }
        let ids: string[] | null = null;
        if (s?.showOnlyUserOwned === 'true') {
            
            ids = await this.authUtilService.searchOwnedIds(
                PostralConstants.ENTITY_NAME_ACCOUNT,
                ['OWNER', 'EDITOR', 'VIEWER'],
                (s?.entityOwnershipGroupId != null
                    ? { ownershipGroupId: s.entityOwnershipGroupId }
                    : { userId: u!.id })
            );


        }

        const where: any = {};
        if (s?.name) {
            where.name = Like('%' + s.name + '%');
        }
        if (ids != null) {
            where.sellerAccountId = In(ids);
        }
        if (s?.entityGroup) {
            where.entityGroup = s.entityGroup;
        }
        if (s?.entityName) {
            where.entityName = s.entityName;
        }
        if (s?.entityId) {
            where.entityId = s.entityId;
        }
        // exec(`kdialog --msgbox "Generated where clause: ${JSON.stringify(where)}" 10 50`);
        // exec(`kdialog --msgbox "Generated where clause: ${JSON.stringify(where)}" 10 50`);
        return where;
    }
}
