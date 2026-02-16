import { Injectable } from '@nestjs/common';
import { InvoiceAccountDTO } from '@tk-postral/payment-common';
import { InvoiceAccount } from '../entity/invoice-account.entity';
import { Account } from '../entity';

@Injectable()
export class InvoiceAccountMapper {

    toEntityFromNormalAccount(account: Account): InvoiceAccount {
        const entity = new InvoiceAccount();
        entity.name = account.name;
        entity.legalIdentity = account.legalIdentity;
        entity.type = account.type;
        entity.realAccountId = account.id;
        return entity;
    }

    toDto(entity: InvoiceAccount): InvoiceAccountDTO {
        return {
            id: entity.id,
            name: entity.name,
            legalIdentity: entity.legalIdentity,
            type: entity.type,
            realAccountId: entity.realAccountId,
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