import { Injectable } from '@nestjs/common';
import { AccountDTO, SnapshotAccountDTO } from '@tk-postral/payment-common';
import { InvoiceAccount, Account } from '@tk-postral/postral-entities';
import { CryptionUtil } from '../util/cryption-util';

@Injectable()
export class InvoiceAccountMapper {
    /**
     *
     */
    constructor(private cryptionUtil: CryptionUtil) {
        
    }
    toEntityFromNormalAccount(account: Account | AccountDTO, fromDto: boolean): InvoiceAccount {

        let fromDtoGate = (a) => a;
        if (fromDto) {
            fromDtoGate = (a) => {
                return this.cryptionUtil.encryptWithConfig(a, "USE_DEFAULT") || '';
            }
        }
        const entity = new InvoiceAccount();
        entity.name = fromDtoGate(account.name);
        // zaten şifreli geliyor...
        entity.legalIdentity = fromDtoGate(account.legalIdentity);
        entity.type = account.type;
        entity.realAccountId = account.id;
        entity.bankName = account.bankName;
        entity.bankIban = fromDtoGate(account.bankIban);
        entity.bankBic = fromDtoGate(account.bankBic);
        entity.bankSwift = fromDtoGate(account.bankSwift);
        entity.taxOffice = fromDtoGate(account.taxOffice);
        entity.website = fromDtoGate(account.website);
        entity.phone = fromDtoGate(account.phone);
        entity.emailAddress = fromDtoGate(account.emailAddress);
        return entity;
    }

    toDto(entity: InvoiceAccount): SnapshotAccountDTO {
        return {
            id: entity.id,
            name: entity.name,
            legalIdentity: this.cryptionUtil.decryptWithConfig(entity.legalIdentity, "USE_DEFAULT") || '',
            type: entity.type,
            realAccountId: entity.realAccountId,
            bankName: entity.bankName,
            bankIban: entity.bankIban,
            bankBic: entity.bankBic,
            bankSwift: entity.bankSwift,
            taxOffice: entity.taxOffice,
        };
    }

    toEntity(dto: SnapshotAccountDTO): InvoiceAccount {
        const entity = new InvoiceAccount();
        if (dto.id) {
            entity.id = dto.id;
        }
        entity.name = dto.name;
        entity.legalIdentity = this.cryptionUtil.encryptWithConfig(dto.legalIdentity, "USE_DEFAULT") || '';
        entity.type = dto.type;
        entity.realAccountId = dto.realAccountId!;
        entity.bankName = this.cryptionUtil.encryptWithConfig(dto.bankName, "USE_DEFAULT") || '';
        entity.bankIban = this.cryptionUtil.encryptWithConfig(dto.bankIban, "USE_DEFAULT") || '';
        entity.bankBic = this.cryptionUtil.encryptWithConfig(dto.bankBic, "USE_DEFAULT") || '';
        entity.bankSwift = this.cryptionUtil.encryptWithConfig(dto.bankSwift, "USE_DEFAULT") || '';
        entity.taxOffice = this.cryptionUtil.encryptWithConfig(dto.taxOffice, "USE_DEFAULT") || '';
        return entity;
    }
}
