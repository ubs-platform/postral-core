import { AccountDTO } from '@tk-postral/payment-common';
import { Account } from '../entity/account.entity';
import { Inject, Injectable } from '@nestjs/common';

@Injectable()
export class AccountMapper {
    async toDtoList(exist: Account[]): Promise<AccountDTO[]> {
        const items: AccountDTO[] = [];
        for (let index = 0; index < exist.length; index++) {
            const existAccount = exist[index];
            items.push(await this.toDto(existAccount));
        }
        return items;
    }

    async toDto(ac: Account): Promise<AccountDTO> {
        return {
            id: ac.id,
            legalIdentity: ac.legalIdentity,
            name: ac.name,
            type: ac.type,
            defaultAddressId: ac.defaultAddressId,
            bankName: ac.bankName,
            bankIban: ac.bankIban,
            bankBic: ac.bankBic,
        };
    }

    async updateEntity(entity: Account, dto: AccountDTO): Promise<Account> {
        // existing.id = dto.id,
        entity.legalIdentity = dto.legalIdentity;
        entity.name = dto.name;
        entity.type = dto.type;
        entity.defaultAddressId = dto.defaultAddressId;
        entity.bankName = dto.bankName;
        entity.bankIban = dto.bankIban;
        entity.bankBic = dto.bankBic;
        return entity;
    }
}
