import { Injectable } from '@nestjs/common';
import { InvoiceAccountDTO } from '@tk-postral/payment-common';
import { InvoiceAccount } from '../entity/invoice-account.entity';

@Injectable()
export class InvoiceAccountMapper {
    toDto(entity: InvoiceAccount): InvoiceAccountDTO {
        return {
            id: entity.id,
            name: entity.name,
            legalIdentity: entity.legalIdentity,
            type: entity.type,
        };
    }

    toEntity(dto: InvoiceAccountDTO): InvoiceAccount {
        const entity = new InvoiceAccount();
        if (dto.id) {
            entity.id = dto.id;
        }
        entity.name = dto.name;
        entity.legalIdentity = dto.legalIdentity;
        entity.type = dto.type;
        return entity;
    }
}