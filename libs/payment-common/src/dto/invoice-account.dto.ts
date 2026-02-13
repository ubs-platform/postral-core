

export class AccountDTO {
    id: string;

    name: string;

    legalIdentity: string;

    type: 'INDIVIDUAL' | 'COMMERCIAL';
    
    defaultAddressId?: string;
    
    ownerUserId?: string;
    entityOwnershipGroupId?: string;
    deactivated?: boolean;

}

export class AccountSearchParamsDTO {
    name?: string;

    legalIdentity?: string;

    type?: 'INDIVIDUAL' | 'COMMERCIAL';

    ownerUserId?: string;
    entityOwnershipGroupId?: string;
    admin?: "true" | "false";
    entityIds?: string[];
    deactivated?: "NOT_DEACTIVATED" | "ONLY_DEACTIVATED" | "ALL";
}
