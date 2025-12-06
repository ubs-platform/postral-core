export class AccountDTO {
    id: string;

    name: string;

    legalIdentity: string;

    type: 'INDIVIDUAL' | 'COMMERCIAL';

    // EO APIsi yerine burada ownerUserId ve eogId kullanabiliriz. Çünkü EO biraz karmaşık bir yapı ve Account
    // devredilen bir yapıdan çok kişisel bir yapı...
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
