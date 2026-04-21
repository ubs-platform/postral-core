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

    async toDto(ac: Account): Promise<AccountDTO> {


        return {
            id: ac.id,
            legalIdentity: this.cryptionUtil.decryptWithConfig(ac.legalIdentity, "USE_DEFAULT") || "",
            name: ac.name,
            type: ac.type,
            defaultAddressId: ac.defaultAddressId,
            bankName: ac.bankName,
            bankIban: this.cryptionUtil.decryptWithConfig(ac.bankIban, "USE_DEFAULT") || "",
            bankBic: this.cryptionUtil.decryptWithConfig(ac.bankBic, "USE_DEFAULT") || "",
            taxOffice: this.cryptionUtil.decryptWithConfig(ac.taxOffice, "USE_DEFAULT") || "",
        };
    }


    async updateEntity(entity: Account, dto: AccountDTO): Promise<Account> {
        // Hassas alanlar şifrelenerek güncellenir; diğer alanlar doğrudan atanır.
        entity.legalIdentity = this.cryptionUtil.encryptWithConfig(dto.legalIdentity, "USE_DEFAULT") || "";
        entity.name = dto.name;
        entity.type = dto.type;
        entity.defaultAddressId = dto.defaultAddressId;
        entity.bankName = dto.bankName;
        entity.bankIban = this.cryptionUtil.encryptWithConfig(dto.bankIban, "USE_DEFAULT") || "";
        entity.bankBic = this.cryptionUtil.encryptWithConfig(dto.bankBic, "USE_DEFAULT") || "";
        entity.taxOffice = this.cryptionUtil.encryptWithConfig(dto.taxOffice, "USE_DEFAULT") || "";
        return entity;
    }
}
