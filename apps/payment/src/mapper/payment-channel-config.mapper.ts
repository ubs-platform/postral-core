import { PaymentChannelConfig } from '@tk-postral/postral-entities';
import { Injectable } from '@nestjs/common';
import { PaymentChannelConfigDTO } from '@tk-postral/payment-common';

@Injectable()
export class PaymentChannelConfigMapper {
    toDto(entity: PaymentChannelConfig): PaymentChannelConfigDTO {
        return {
            id: entity.id,
            channelId: entity.channelId,
            name: entity.name,
            enabled: entity.enabled,
            devOnly: entity.devOnly,
            description: entity.description,
            createdAt: entity.createdAt,
            updatedAt: entity.updatedAt,
        };
    }

    updateEntity(entity: PaymentChannelConfig, dto: PaymentChannelConfigDTO): PaymentChannelConfig {
        entity.channelId = dto.channelId;
        entity.name = dto.name;
        entity.enabled = dto.enabled ?? true;
        entity.devOnly = dto.devOnly ?? false;
        entity.description = dto.description ?? null;
        return entity;
    }
}
