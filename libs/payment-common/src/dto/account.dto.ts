

export class AccountDTO {
    id: string;

    name: string;

    legalIdentity: string;

    type: 'INDIVIDUAL' | 'COMMERCIAL';

    ownerUserId?: string;
    entityOwnershipGroupId?: string;
}

export class AccountSearchParamsDTO {
    name?: string;

    legalIdentity?: string;

    type?: 'INDIVIDUAL' | 'COMMERCIAL';

    ownerUserId?: string;
    entityOwnershipGroupId?: string;
    admin?: "true" | "false";

    
}
