import { Injectable } from '@nestjs/common';
import { AccountDTO, SnapshotAccountDTO } from '@tk-postral/payment-common';
import { InvoiceAccount, Account, SnapshotBankAccount } from '@tk-postral/postral-entities';
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

        if (account.bankAccounts) {
            entity.bankAccounts = account.bankAccounts.map(ba => {
                const b = new SnapshotBankAccount();
                b.bankName = ba.bankName;
                b.currency = ba.currency;
                b.bankIban = fromDtoGate(ba.bankIban);
                b.bankBic = fromDtoGate(ba.bankBic);
                b.bankSwift = fromDtoGate(ba.bankSwift);
                return b;
            });
        }

        return entity;
    }

    toDto(entity: InvoiceAccount): SnapshotAccountDTO {
        return {
            id: entity.id,
            name: entity.name,
            legalIdentity: this.cryptionUtil.decryptWithConfig(entity.legalIdentity, "USE_DEFAULT") || '',
            type: this.cryptionUtil.decryptWithConfig(entity.type, "THROW") as any,
            realAccountId: this.cryptionUtil.decryptWithConfig(entity.realAccountId, "USE_DEFAULT") || '',
            bankName: entity.bankName,
            bankIban: entity.bankIban,
            bankBic: entity.bankBic,
            bankSwift: entity.bankSwift,
            taxOffice: this.cryptionUtil.decryptWithConfig(entity.taxOffice, "USE_DEFAULT") || '',
            emailAddress: this.cryptionUtil.decryptWithConfig(entity.emailAddress, "USE_DEFAULT") || '',
            phone: this.cryptionUtil.decryptWithConfig(entity.phone, "USE_DEFAULT") || '',
            bankAccounts: entity.bankAccounts?.map(ba => ({
                id: ba.id,
                bankName: ba.bankName,
                currency: ba.currency,
                bankIban: this.cryptionUtil.decryptWithConfig(ba.bankIban, "USE_DEFAULT") || '',
                bankBic: this.cryptionUtil.decryptWithConfig(ba.bankBic, "USE_DEFAULT") || '',
                bankSwift: this.cryptionUtil.decryptWithConfig(ba.bankSwift, "USE_DEFAULT") || '',
            })) || [],
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
        entity.emailAddress = this.cryptionUtil.encryptWithConfig(dto.emailAddress, "USE_DEFAULT") || '';
        entity.phone = this.cryptionUtil.encryptWithConfig(dto.phone, "USE_DEFAULT") || '';
        
        if (dto.bankAccounts) {
            entity.bankAccounts = dto.bankAccounts.map(ba => {
                const b = new SnapshotBankAccount();
                if (ba.id) b.id = ba.id;
                b.bankName = ba.bankName;
                b.currency = ba.currency;
                b.bankIban = this.cryptionUtil.encryptWithConfig(ba.bankIban, "USE_DEFAULT") || '';
                b.bankBic = this.cryptionUtil.encryptWithConfig(ba.bankBic, "USE_DEFAULT") || '';
                b.bankSwift = this.cryptionUtil.encryptWithConfig(ba.bankSwift, "USE_DEFAULT") || '';
                return b;
            });
        }

        return entity;
    }
}
