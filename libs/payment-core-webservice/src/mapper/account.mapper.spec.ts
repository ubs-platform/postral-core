import { Test } from '@nestjs/testing';
import { Account } from '@tk-postral/postral-entities';
import { AccountMapper } from './account.mapper';
import { CryptionUtil } from '../util/cryption-util';

describe('AccountMapper report setup eligibility', () => {
    it.each([true, false])('exposes deactivated=%s so the UI can gate report setup', async deactivated => {
        const module = await Test.createTestingModule({
            providers: [
                AccountMapper,
                { provide: CryptionUtil, useValue: { decryptWithConfig: jest.fn() } },
            ],
        }).compile();
        const mapper = module.get(AccountMapper);
        const account = Object.assign(new Account(), { id: 'seller', name: 'Seller', type: 'COMMERCIAL', deactivated });
        expect((await mapper.toDto(account)).deactivated).toBe(deactivated);
    });
});
