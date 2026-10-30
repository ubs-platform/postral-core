import type { SubMerchantSourceDTO } from '@tk-postral/payment-common';
import { of } from 'rxjs';
import { IyzicoSubMerchant } from './iyzico-sub-merchant.entity';
import { IyzicoSubMerchantService } from './iyzico-sub-merchant.service';

const source: SubMerchantSourceDTO = {
    account: {
        id: 'account-1',
        name: 'Foo Ltd. Şti.',
        legalIdentity: '9261877000',
        type: 'COMMERCIAL',
        taxOffice: 'Kadıköy',
        emailAddress: 'foo@example.com',
        phone: '+905350000000',
        bankAccounts: [{ bankIban: 'TR180006200119000006672315', currency: 'TRY' }],
    },
    defaultAddress: {
        streetName: 'Bora Sok.',
        citySubdivisionName: 'Kadıköy',
        cityName: 'İstanbul',
    } as SubMerchantSourceDTO['defaultAddress'],
};

describe('IyzicoSubMerchantService', () => {
    let row: IyzicoSubMerchant | null;
    const client = {
        fingerprint: jest.fn(),
        createSubMerchant: jest.fn(),
        updateSubMerchant: jest.fn(),
        retrieveSubMerchantKey: jest.fn(),
    };
    const messages = { send: jest.fn() };
    const manager = {
        findOneOrFail: jest.fn(),
        update: jest.fn(),
    };
    const insertChain = {
        insert: jest.fn().mockReturnThis(),
        values: jest.fn().mockReturnThis(),
        orIgnore: jest.fn().mockReturnThis(),
        execute: jest.fn(),
    };
    const repo = {
        findOneBy: jest.fn(),
        createQueryBuilder: jest.fn(() => insertChain),
        manager: { transaction: jest.fn((work: (m: typeof manager) => unknown) => work(manager)) },
    };
    let service: IyzicoSubMerchantService;

    beforeEach(() => {
        jest.clearAllMocks();
        row = null;
        client.fingerprint.mockReturnValue('hash-1');
        messages.send.mockReturnValue(of(source));
        repo.findOneBy.mockImplementation(async () => row);
        manager.findOneOrFail.mockImplementation(async () => row ?? { accountId: 'account-1', subMerchantKey: null });
        service = new IyzicoSubMerchantService(repo as never, client as never, messages as never);
    });

    it('kayıt yoksa oluşturur ve anahtar ile özeti saklar', async () => {
        client.createSubMerchant.mockResolvedValue('key-1');

        await expect(service.ensure('account-1')).resolves.toBe('key-1');

        expect(messages.send).toHaveBeenCalledWith('postral/account/get-sub-merchant-source', 'account-1');
        expect(client.createSubMerchant).toHaveBeenCalledWith(
            expect.objectContaining({
                subMerchantType: 'LIMITED_OR_JOINT_STOCK_COMPANY',
                subMerchantExternalId: 'account-1',
            }),
        );
        expect(client.updateSubMerchant).not.toHaveBeenCalled();
        expect(manager.update).toHaveBeenCalledWith(IyzicoSubMerchant, 'account-1', {
            subMerchantKey: 'key-1',
            subMerchantType: 'LIMITED_OR_JOINT_STOCK_COMPANY',
            payloadHash: 'hash-1',
        });
    });

    it('özet aynıysa iyzico çağrılmaz', async () => {
        row = { accountId: 'account-1', subMerchantKey: 'key-1', subMerchantType: 'X', payloadHash: 'hash-1' } as IyzicoSubMerchant;

        await expect(service.ensure('account-1')).resolves.toBe('key-1');

        expect(repo.manager.transaction).not.toHaveBeenCalled();
        expect(client.createSubMerchant).not.toHaveBeenCalled();
        expect(client.updateSubMerchant).not.toHaveBeenCalled();
    });

    it('özet değiştiyse update gönderir ve özeti yeniler', async () => {
        row = {
            accountId: 'account-1',
            subMerchantKey: 'key-1',
            subMerchantType: 'LIMITED_OR_JOINT_STOCK_COMPANY',
            payloadHash: 'old-hash',
        } as IyzicoSubMerchant;

        await expect(service.ensure('account-1')).resolves.toBe('key-1');

        expect(client.updateSubMerchant).toHaveBeenCalledWith(
            'key-1',
            expect.not.objectContaining({ subMerchantType: expect.anything() }),
        );
        expect(client.createSubMerchant).not.toHaveBeenCalled();
        expect(manager.update).toHaveBeenCalledWith(
            IyzicoSubMerchant,
            'account-1',
            expect.objectContaining({ payloadHash: 'hash-1' }),
        );
    });

    it('tip değiştiyse iyzico çağrılmadan çakışma hatası verir', async () => {
        row = { accountId: 'account-1', subMerchantKey: 'key-1', subMerchantType: 'PRIVATE_COMPANY', payloadHash: 'old-hash' } as IyzicoSubMerchant;

        await expect(service.ensure('account-1')).rejects.toThrow(/type/);
        expect(client.updateSubMerchant).not.toHaveBeenCalled();
    });

    it('create başarısız olursa dış kimlikle bulup update eder', async () => {
        client.createSubMerchant.mockRejectedValue(new Error('duplicate'));
        client.retrieveSubMerchantKey.mockResolvedValue('key-9');

        await expect(service.ensure('account-1')).resolves.toBe('key-9');

        expect(client.updateSubMerchant).toHaveBeenCalledWith('key-9', expect.any(Object));
        expect(manager.update).toHaveBeenCalledWith(
            IyzicoSubMerchant,
            'account-1',
            expect.objectContaining({ subMerchantKey: 'key-9' }),
        );
    });

    it('create ve retrieve başarısızsa ilk hatayı fırlatır, kayıt yazmaz', async () => {
        const original = new Error('boom');
        client.createSubMerchant.mockRejectedValue(original);
        client.retrieveSubMerchantKey.mockRejectedValue(new Error('not found'));

        await expect(service.ensure('account-1')).rejects.toBe(original);
        expect(manager.update).not.toHaveBeenCalled();
    });

    it('eksik hesap verisinde iyzico çağrılmaz', async () => {
        messages.send.mockReturnValue(of({ account: { ...source.account, emailAddress: '' }, defaultAddress: source.defaultAddress }));

        await expect(service.ensure('account-1')).rejects.toThrow(/emailAddress/);
        expect(client.createSubMerchant).not.toHaveBeenCalled();
    });
});
