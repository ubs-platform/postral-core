import type { SubMerchantSourceDTO } from '@tk-postral/payment-common';
import { mapSubMerchant, toUpdatePayload } from './iyzico-sub-merchant.mapper';

function source(overrides: Partial<SubMerchantSourceDTO['account']> = {}): SubMerchantSourceDTO {
    return {
        account: {
            id: 'account-1',
            name: 'Foo Yayınları Ltd. Şti.',
            legalIdentity: '9261877000',
            type: 'COMMERCIAL',
            taxOffice: 'Kadıköy',
            emailAddress: 'foo@example.com',
            phone: '+905350000000',
            contactName: 'Ayşe Kaya',
            deactivated: false,
            bankAccounts: [
                { bankIban: 'DE00 0000', currency: 'EUR' },
                { bankIban: 'tr18 0006 2001 1900 0006 6723 15', currency: 'TRY', bankSwift: 'TEBUTRIS' },
            ],
            ...overrides,
        },
        defaultAddress: {
            name: 'Merkez',
            streetName: 'Bora Sok.',
            buildingNumber: '1',
            district: 'Merdivenköy',
            citySubdivisionName: 'Kadıköy',
            cityName: 'İstanbul',
            postalZone: '34000',
            country: 'TR',
        } as SubMerchantSourceDTO['defaultAddress'],
    };
}

describe('mapSubMerchant', () => {
    it('Ltd. Şti. ile biten ticari hesabı sermaye şirketi olarak eşler', () => {
        expect(mapSubMerchant(source())).toEqual({
            subMerchantType: 'LIMITED_OR_JOINT_STOCK_COMPANY',
            subMerchantExternalId: 'account-1',
            name: 'Foo Yayınları Ltd. Şti.',
            legalCompanyTitle: 'Foo Yayınları Ltd. Şti.',
            email: 'foo@example.com',
            gsmNumber: '+905350000000',
            address: 'Bora Sok. 1 Merdivenköy Kadıköy İstanbul',
            iban: 'TR180006200119000006672315',
            swiftCode: 'TEBUTRIS',
            currency: 'TRY',
            taxNumber: '9261877000',
            taxOffice: 'Kadıköy',
            contactName: 'Ayşe',
            contactSurname: 'Kaya',
        });
    });

    it('unvan eki yoksa şahıs şirketi olarak 11 haneli kimlik numarasını kullanır', () => {
        const payload = mapSubMerchant(source({ name: 'Ahmet Yılmaz Kırtasiye', legalIdentity: '31300864726' }));
        expect(payload.subMerchantType).toBe('PRIVATE_COMPANY');
        expect(payload.identityNumber).toBe('31300864726');
        expect(payload.taxNumber).toBeUndefined();
    });

    it('şahıs şirketinde 11 haneli olmayan kimlik numarasını reddeder', () => {
        expect(() => mapSubMerchant(source({ name: 'Ahmet Yılmaz Kırtasiye' }))).toThrow(/11-digit/);
    });

    it('bireysel hesabı PERSONAL yapar ve contactName yoksa adı bölerek kullanır', () => {
        const payload = mapSubMerchant(
            source({ type: 'INDIVIDUAL', name: 'Mehmet ÖZ DEMİR', legalIdentity: '31300864726', contactName: '' }),
        );
        expect(payload).toMatchObject({
            subMerchantType: 'PERSONAL',
            contactName: 'Mehmet',
            contactSurname: 'ÖZ DEMİR',
            identityNumber: '31300864726',
        });
        expect(payload.taxOffice).toBeUndefined();
    });

    it('TRY hesap yoksa para birimi boş hesabı, o da yoksa eski IBAN alanını kullanır', () => {
        expect(
            mapSubMerchant(source({ bankAccounts: [{ bankIban: 'TR11', currency: undefined }] })).iban,
        ).toBe('TR11');
        expect(mapSubMerchant(source({ bankAccounts: [], bankIban: 'TR22' })).iban).toBe('TR22');
    });

    it.each([
        ['IBAN', { bankAccounts: [{ bankIban: 'DE00', currency: 'EUR' }] }],
        ['email', { emailAddress: '' }],
        ['phone', { phone: '' }],
        ['tax office', { taxOffice: '' }],
    ])('eksik %s için hata verir', (_label, overrides) => {
        expect(() => mapSubMerchant(source(overrides))).toThrow(/requires/);
    });

    it('varsayılan adres yoksa hata verir', () => {
        expect(() => mapSubMerchant({ ...source(), defaultAddress: undefined })).toThrow(/default address/);
    });

    it('pasif hesabı reddeder', () => {
        expect(() => mapSubMerchant(source({ deactivated: true }))).toThrow(/deactivated/);
    });
});

describe('toUpdatePayload', () => {
    it('tip ve dış kimliği update gövdesinden çıkarır', () => {
        const update = toUpdatePayload(mapSubMerchant(source()));
        expect(update).not.toHaveProperty('subMerchantType');
        expect(update).not.toHaveProperty('subMerchantExternalId');
        expect(update).toHaveProperty('iban');
    });
});
