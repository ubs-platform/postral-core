import { Injectable } from '@nestjs/common';
import { ExternalPlatform } from '@tk-postral/postral-entities';
import { ExternalPlatformDTO } from '@tk-postral/payment-common';

@Injectable()
export class ExternalPlatformMapper {
    toDto(entity: ExternalPlatform): ExternalPlatformDTO {
        return {
            id: entity.id,
            name: entity.name,
            code: entity.code,
            active: entity.active,
            createdAt: entity.createdAt,
            updatedAt: entity.updatedAt,
        };
    }

    updateEntity(entity: ExternalPlatform, dto: ExternalPlatformDTO): ExternalPlatform {
        entity.name = dto.name || '';
        entity.code = dto.code || '';
        entity.active = dto.active ?? true;
        return entity;
    }
}
