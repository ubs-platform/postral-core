import { Injectable } from '@nestjs/common';
import { ReportQuery } from '../entity/report-query.entity';
import { ReportQueryDTO } from '@tk-postral/payment-common';

@Injectable()
export class ReportQueryMapper {
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

    updateEntity(entity: ReportQuery, dto: ReportQueryDTO): ReportQuery {
        entity.name = dto.name;
        entity.description = dto.description ?? entity.description;
        entity.ownerAccountId = dto.ownerAccountId;
        entity.currency = dto.currency;
        entity.dateGrouping = dto.dateGrouping;
        return entity;
    }
}
