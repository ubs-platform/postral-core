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
        entity.bankName = account.bankName;
        entity.bankIban = account.bankIban;
        entity.bankBic = account.bankBic;
        entity.bankSwift = account.bankSwift;
        return entity;
    }

    toDto(entity: InvoiceAccount): InvoiceAccountDTO {
        return {
            id: entity.id,
            name: entity.name,
            legalIdentity: entity.legalIdentity,
            type: entity.type,
            realAccountId: entity.realAccountId,
            bankName: entity.bankName,
            bankIban: entity.bankIban,
            bankBic: entity.bankBic,
            bankSwift: entity.bankSwift,
            taxOffice: entity.taxOffice,
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
        entity.realAccountId = dto.realAccountId!;
        entity.bankName = dto.bankName;
        entity.bankIban = dto.bankIban;
        entity.bankBic = dto.bankBic;
        entity.bankSwift = dto.bankSwift;
        entity.taxOffice = dto.taxOffice;
        return entity;
    }
}
