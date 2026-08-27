import { InternalSearchDTO } from './internal-search.dto';
import { BankAccountDTO } from './bank-account.dto';

export class AccountDTO {
    id!: string;

    name!: string;

    phone?: string;
    website?: string;
    emailAddress?: string;
    legalIdentity!: string;

    type!: 'INDIVIDUAL' | 'COMMERCIAL';

    defaultAddressId?: string;
    
    ownerUserId?: string;
    entityOwnershipGroupId?: string;
    deactivated?: boolean;
    taxOffice?: string;
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

    bankAccounts?: BankAccountDTO[];

    // Harici platform (Hepsiburada, Trendyol vb.) müşteri eşlemesi için.
    externalPlatformId?: string;
    externalPlatformAccountId?: string;
}

export class AccountSearchParamsDTO implements InternalSearchDTO {
    name?: string;

    // Eğer hassas alanlar şifrelenmişse, arama için de şifrelenmiş değerler kullanılmalıdır. Bu nedenle, hassas alanlar için arama yapılacaksa, bu alanların şifrelenmiş değerleri kullanılmalıdır.
    legalIdentity?: string;

    type?: 'INDIVIDUAL' | 'COMMERCIAL';

    deactivated?: 'NOT_DEACTIVATED' | 'ONLY_DEACTIVATED' | 'ALL';
    taxOffice?: string;

    ownerUserId?: string;
    entityOwnershipGroupId?: string;
    entityIds?: string[];
    admin?: 'true' | 'false';
}
