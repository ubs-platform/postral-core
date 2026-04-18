import { AccountDTO } from '@tk-postral/payment-common';
import { Account } from '../entity/account.entity';
import { Inject, Injectable } from '@nestjs/common';
import { CryptionUtil } from '../util/cryption-util';

@Injectable()
export class AccountMapper {
    /**
     *
     */
    constructor(private cryptionUtil: CryptionUtil) {

    }
    async toDtoList(exist: Account[]): Promise<AccountDTO[]> {
        const items: AccountDTO[] = [];
        for (let index = 0; index < exist.length; index++) {
            const existAccount = exist[index];
            items.push(await this.toDto(existAccount));
        }
        return items;
    }

    async toDto(ac: Account, redactSensitive = false): Promise<AccountDTO> {

        const legalIdentity = !redactSensitive ?
            ac.legalIdentity ? this.cryptionUtil.decryptWithConfig(ac.legalIdentity, "USE_DEFAULT") : ""
            : "REDACTED"

        return {
            id: ac.id,
            legalIdentity: legalIdentity,
            name: ac.name,
            type: ac.type,
            defaultAddressId: ac.defaultAddressId,
            bankName: ac.bankName,
            bankIban: ac.bankIban,
            bankBic: ac.bankBic,
            taxOffice: ac.taxOffice,
        };
    }

    async updateEntity(entity: Account, dto: AccountDTO): Promise<Account> {
        // Sadece legalIdentity güncellenirken şifreleme yapılır. Diğer alanlar doğrudan atanır.
        if (dto.legalIdentity && dto.legalIdentity !== "REDACTED") {
            entity.legalIdentity = this.cryptionUtil.encryptWithConfig(dto.legalIdentity, "USE_DEFAULT");
        }
        // entity.legalIdentity = this.cryptionUtil.encryptWithConfig(dto.legalIdentity);
        entity.name = dto.name;
        entity.type = dto.type;
        entity.defaultAddressId = dto.defaultAddressId;
        entity.bankName = dto.bankName;
        entity.bankIban = dto.bankIban;
        entity.bankBic = dto.bankBic;
        entity.taxOffice = dto.taxOffice;
        return entity;
    }
}
