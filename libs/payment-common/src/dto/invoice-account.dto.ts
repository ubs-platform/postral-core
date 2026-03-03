export class InvoiceAccountDTO {
    id: string;

    name: string;

    legalIdentity: string;

    type: 'INDIVIDUAL' | 'COMMERCIAL';

    realAccountId?: string;

    bankName?: string;

    bankIban?: string;

    bankBic?: string;

    bankSwift?: string;
}
