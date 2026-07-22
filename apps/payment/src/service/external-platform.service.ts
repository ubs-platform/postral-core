import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { ExternalPlatform } from '@tk-postral/postral-entities';
import { Repository } from 'typeorm';
import { ExternalPlatformMapper } from '../mapper/external-platform.mapper';
import { ExternalPlatformDTO } from '@tk-postral/payment-common';
import { SearchRequest, SearchResult } from '@ubs-platform/crud-base-common';
import { TypeormSearchUtil } from './base/typeorm-search-util';

@Injectable()
export class ExternalPlatformService {
    constructor(
        @InjectRepository(ExternalPlatform)
        private readonly externalPlatformRepo: Repository<ExternalPlatform>,
        private readonly externalPlatformMapper: ExternalPlatformMapper,
    ) { }

    async fetchAll(searchReq?: SearchRequest): Promise<SearchResult<ExternalPlatformDTO>> {
        const search = await TypeormSearchUtil.modelSearch(
            this.externalPlatformRepo,
            searchReq?.size || 10,
            searchReq?.page || 0,
            { createdAt: 'asc' },
            [],
            {},
        );
        return search.map((e) => this.externalPlatformMapper.toDto(e));
    }

    async fetchOne(id: string): Promise<ExternalPlatform | null> {
        return await this.externalPlatformRepo.findOneBy({ id });
    }

    async fetchOneByCode(code: string): Promise<ExternalPlatform | null> {
        return await this.externalPlatformRepo.findOneBy({ code });
    }

    async editOrCreate(dto: ExternalPlatformDTO): Promise<ExternalPlatformDTO> {
        let entity: ExternalPlatform | null = null;
        if (dto.id) {
            entity = await this.externalPlatformRepo.findOneBy({ id: dto.id });
        }
        if (!entity) {
            entity = new ExternalPlatform();
        }
        entity = this.externalPlatformMapper.updateEntity(entity, dto);
        await this.externalPlatformRepo.save(entity);
        return this.externalPlatformMapper.toDto(entity);
    }

    async edit(dto: ExternalPlatformDTO): Promise<ExternalPlatformDTO> {
        if (!dto.id) {
            throw new NotFoundException('ID is required');
        }
        let entity = await this.externalPlatformRepo.findOneBy({ id: dto.id });
        if (!entity) {
            throw new NotFoundException(`ExternalPlatform with ID ${dto.id} not found`);
        }
        entity = this.externalPlatformMapper.updateEntity(entity, dto);
        await this.externalPlatformRepo.save(entity);
        return this.externalPlatformMapper.toDto(entity);
    }

    async removeById(id: string): Promise<void> {
        const entity = await this.externalPlatformRepo.findOneBy({ id });
        if (!entity) {
            throw new NotFoundException(`ExternalPlatform with ID ${id} not found`);
        }
        await this.externalPlatformRepo.remove(entity);
    }
}
