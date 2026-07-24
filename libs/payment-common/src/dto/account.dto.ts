import { InternalSearchDTO } from './internal-search.dto';

export class AccountDTO {
    id: string;

    name: string;

    phone?: string;

    legalIdentity: string;

    type: 'INDIVIDUAL' | 'COMMERCIAL';

    defaultAddressId?: string;

    ownerUserId?: string;
    entityOwnershipGroupId?: string;
    deactivated?: boolean;
    taxOffice?: string;
    bankName?: string;
    bankIban?: string;
    bankBic?: string;
    bankSwift?: string;

    // Harici platform (Hepsiburada, Trendyol vb.) müşteri eşlemesi için.
    externalPlatformId?: string;
    externalPlatformAccountId?: string;
}

export class AccountSearchParamsDTO implements InternalSearchDTO {
    name?: string;

    legalIdentity?: string;

    type?: 'INDIVIDUAL' | 'COMMERCIAL';

    deactivated?: 'NOT_DEACTIVATED' | 'ONLY_DEACTIVATED' | 'ALL';
    taxOffice?: string;

    ownerUserId?: string;
    entityOwnershipGroupId?: string;
    entityIds?: string[];
    admin?: 'true' | 'false';
}
