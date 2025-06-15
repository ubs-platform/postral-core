import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import {
    ItemDTO,
    ItemEditDTO,
    ItemSearchDTO,
} from '@tk-postral/payment-common';
import { Account } from '../entity/account.entity';
import { Item } from '../entity/item.entity';
import { ItemMapper } from '../mapper/item.mapper';

@Injectable()
export class ItemService {
    constructor(
        @InjectRepository(Item)
        private readonly itemRepo: Repository<Item>,
        private readonly itemMapper: ItemMapper,
    ) {}

    async fetchAll(search: ItemSearchDTO) {
        return this.itemMapper.toDtoList(
            await this.itemRepo.find({ where: search }),
        );
    }

    async fetchOne(id: string) {
        let exist = await this.itemRepo.findOne({ where: { id } });
        if (exist) {
            return await this.itemMapper.toDto(exist);
        } else {
            throw new NotFoundException('Account');
        }
    }

    async delete(id: string) {
        await this.itemRepo.delete({ id });
    }

    async add(dto: ItemDTO) {
        const a = await this.itemRepo.save(
            await this.itemMapper.updateEntity(new Item(), dto),
        );
        return this.itemMapper.toDto(a);
    }

    async edit(dto: ItemEditDTO) {
        let exist = await this.itemRepo.findOne({ where: { id: dto.id } });
        if (exist) {
            exist = await this.itemMapper.updateEntityEdit(exist, dto);
            exist = await this.itemRepo.save(exist);
            return exist;
        } else {
            throw new NotFoundException('Account');
        }
    }
}
