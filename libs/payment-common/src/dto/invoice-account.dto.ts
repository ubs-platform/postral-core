import { SnapshotBankAccountDTO } from './snapshot-bank-account.dto';

export class SnapshotAccountDTO {
    id!: string;

    name!: string;

    legalIdentity!: string;

    type!: 'INDIVIDUAL' | 'COMMERCIAL';

    realAccountId?: string;

    /**
     * @deprecated Use bankAccounts instead
     */
    bankName?: string;

    /**
     * @deprecated Use bankAccounts instead
     */
    bankIban?: string;

    /**
     * @deprecated Use bankAccounts instead
     */
    bankBic?: string;

    /**
     * @deprecated Use bankAccounts instead
     */
    bankSwift?: string;

    bankAccounts?: SnapshotBankAccountDTO[];

    taxOffice?: string;


    phone?: string;

    website?: string;

    emailAddress?: string;
}
