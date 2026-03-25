import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ReportQuery } from '../entity/report-query.entity';
import { ReportQueryCreateDTO, ReportQueryDTO, ReportQuerySearchDTO } from '@tk-postral/payment-common';

@Injectable()
export class ReportQueryService {
    constructor(
        @InjectRepository(ReportQuery)
        private readonly repo: Repository<ReportQuery>,
    ) {}

    async create(dto: ReportQueryCreateDTO): Promise<ReportQueryDTO> {
        const entity = this.repo.create({
            name: dto.name,
            description: dto.description ?? '',
            ownerAccountId: dto.ownerAccountId,
            currency: dto.currency,
            dateGrouping: dto.dateGrouping,
        });
        const saved = await this.repo.save(entity);
        return this.toDto(saved);
    }

    async findById(id: string): Promise<ReportQueryDTO> {
        const entity = await this.repo.findOne({ where: { id } });
        if (!entity) throw new NotFoundException(`ReportQuery not found: ${id}`);
        return this.toDto(entity);
    }

    async findByIdRaw(id: string): Promise<ReportQuery> {
        const entity = await this.repo.findOne({ where: { id } });
        if (!entity) throw new NotFoundException(`ReportQuery not found: ${id}`);
        return entity;
    }

    async findAll(search: ReportQuerySearchDTO): Promise<ReportQueryDTO[]> {
        const where: Partial<ReportQuery> = {};
        if (search.ownerAccountId) where.ownerAccountId = search.ownerAccountId;
        const entities = await this.repo.find({ where });
        return entities.map((e) => this.toDto(e));
    }

    async update(id: string, dto: ReportQueryCreateDTO): Promise<ReportQueryDTO> {
        const entity = await this.findByIdRaw(id);
        entity.name = dto.name;
        entity.description = dto.description ?? entity.description;
        entity.ownerAccountId = dto.ownerAccountId;
        entity.currency = dto.currency;
        entity.dateGrouping = dto.dateGrouping;
        const saved = await this.repo.save(entity);
        return this.toDto(saved);
    }

    async remove(id: string): Promise<void> {
        await this.repo.delete(id);
    }

    toDto(entity: ReportQuery): ReportQueryDTO {
        const dto = new ReportQueryDTO();
        dto.id = entity.id;
        dto.name = entity.name;
        dto.description = entity.description;
        dto.ownerAccountId = entity.ownerAccountId;
        dto.currency = entity.currency;
        dto.dateGrouping = entity.dateGrouping;
        dto.createdAt = entity.createdAt;
        dto.updatedAt = entity.updatedAt;
        return dto;
    }
}
