import { AccountDTO } from '@tk-postral/payment-common';
import { Account } from '../entity/account.entity';
import { Inject, Injectable } from '@nestjs/common';

@Injectable()
export class AccountMapper {
    async toDto(ac: Account): Promise<AccountDTO> {
        return {
            id: ac.id,
            legalIdentity: ac.legalIdentity,
            name: ac.name,
            type: ac.type,
        };
    }

    async updateEntity(entity: Account, dto: AccountDTO): Promise<Account> {
        // existing.id = dto.id,
        entity.legalIdentity = dto.legalIdentity;
        entity.name = dto.name;
        entity.type = dto.type;

        return entity;
    }
}
