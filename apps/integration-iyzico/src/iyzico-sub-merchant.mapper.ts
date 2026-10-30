import { BadRequestException } from '@nestjs/common';
import {
    isLimitedOrJointStockCompanyName,
    splitPersonName,
} from '@tk-postral/common-utils';
import type { SubMerchantSourceDTO } from '@tk-postral/payment-common';

export type IyzicoSubMerchantType =
    | 'PERSONAL'
    | 'PRIVATE_COMPANY'
    | 'LIMITED_OR_JOINT_STOCK_COMPANY';

/** Create ve update isteklerinin ortak alanları; `subMerchantType` değiştirilemez. */
export interface IyzicoSubMerchantPayload {
    subMerchantType: IyzicoSubMerchantType;
    subMerchantExternalId: string;
    name: string;
    email: string;
    gsmNumber: string;
    address: string;
    iban: string;
    currency: 'TRY';
    swiftCode?: string;
    contactName?: string;
    contactSurname?: string;
    legalCompanyTitle?: string;
    identityNumber?: string;
    taxNumber?: string;
    taxOffice?: string;
}

function required(value: string | undefined, field: string): string {
    const trimmed = value?.trim();
    if (!trimmed) {
        throw new BadRequestException(`iyzico sub-merchant requires ${field}`);
    }
    return trimmed;
}

function optional(value: string | undefined): string | undefined {
    return value?.trim() || undefined;
}

export function mapSubMerchant(
    source: SubMerchantSourceDTO,
): IyzicoSubMerchantPayload {
    const { account, defaultAddress: address } = source;
    if (account.deactivated) {
        throw new BadRequestException(
            'iyzico sub-merchant cannot be created for a deactivated account',
        );
    }
    const subMerchantType: IyzicoSubMerchantType =
        account.type === 'INDIVIDUAL'
            ? 'PERSONAL'
            : isLimitedOrJointStockCompanyName(account.name)
              ? 'LIMITED_OR_JOINT_STOCK_COMPANY'
              : 'PRIVATE_COMPANY';
    const name = required(account.name, 'account.name');
    const legalIdentity = required(account.legalIdentity, 'account.legalIdentity');

    const bankAccount =
        account.bankAccounts?.find(
            (bank) => bank.currency === 'TRY' && bank.bankIban?.trim(),
        ) ??
        account.bankAccounts?.find(
            (bank) => !bank.currency && bank.bankIban?.trim(),
        );
    const iban = required(
        bankAccount?.bankIban ?? account.bankIban,
        'a TRY bank account IBAN',
    )
        .replace(/\s+/g, '')
        .toUpperCase();

    const registrationAddress = [
        address?.streetName,
        address?.buildingNumber,
        address?.room,
        address?.district,
        address?.citySubdivisionName,
        address?.cityName,
    ]
        .filter(Boolean)
        .join(' ');

    const payload: IyzicoSubMerchantPayload = {
        subMerchantType,
        subMerchantExternalId: required(account.id, 'account.id'),
        name,
        email: required(account.emailAddress, 'account.emailAddress'),
        gsmNumber: required(account.phone, 'account.phone'),
        address: required(registrationAddress, 'a default address'),
        iban,
        currency: 'TRY',
        swiftCode: optional(bankAccount?.bankSwift ?? account.bankSwift),
    };

    const contactSource = optional(account.contactName);
    if (subMerchantType === 'PERSONAL') {
        const person = splitPersonName(contactSource ?? name);
        if (!person) {
            throw new BadRequestException(
                'iyzico sub-merchant requires a contact name and surname',
            );
        }
        payload.contactName = person.givenName;
        payload.contactSurname = person.familyName;
        payload.identityNumber = legalIdentity;
        return payload;
    }

    const person = contactSource ? splitPersonName(contactSource) : null;
    if (person) {
        payload.contactName = person.givenName;
        payload.contactSurname = person.familyName;
    }
    payload.legalCompanyTitle = name;
    payload.taxOffice = required(account.taxOffice, 'account.taxOffice');
    if (subMerchantType === 'PRIVATE_COMPANY') {
        if (!/^\d{11}$/.test(legalIdentity)) {
            throw new BadRequestException(
                'iyzico PRIVATE_COMPANY sub-merchant requires an 11-digit identity number as legalIdentity; add a Ltd. Şti./A.Ş. suffix for tax-number companies',
            );
        }
        payload.identityNumber = legalIdentity;
    } else {
        payload.taxNumber = legalIdentity;
    }
    return payload;
}

/** `subMerchantType` ve `subMerchantExternalId` update isteğinde gönderilmez. */
export function toUpdatePayload(payload: IyzicoSubMerchantPayload) {
    const {
        subMerchantType: _type,
        subMerchantExternalId: _externalId,
        ...update
    } = payload;
    return update;
}
