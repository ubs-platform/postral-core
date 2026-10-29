import { Test } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { IsNull } from 'typeorm';
import { AccountPaymentTransaction } from '@tk-postral/postral-entities';
import { AccountPaymentTransactionDTO } from '@tk-postral/payment-common';
import { AccountPaymentTransactionService } from './account-payment-transaction.service';
import { AccountPaymentTransactionMapper } from '../mapper/account-payment-transaction.mapper';

describe('Payment ledger regeneration', () => {
    it('replaces nominal payment entries without removing posted rounding adjustments', async () => {
        const repo = {
            find: jest.fn().mockResolvedValue([]), remove: jest.fn(),
            save: jest.fn().mockImplementation(async entries => entries),
        };
        const module = await Test.createTestingModule({
            providers: [
                AccountPaymentTransactionService, AccountPaymentTransactionMapper,
                { provide: getRepositoryToken(AccountPaymentTransaction), useValue: repo },
            ],
        }).compile();
        const service = module.get(AccountPaymentTransactionService);
        const dto = Object.assign(new AccountPaymentTransactionDTO(), {
            paymentId: 'refund-payment', accountId: 'buyer', type: 'CREDIT', amount: 3.3333,
        });
        await service.createNew(dto);
        expect(repo.find).toHaveBeenCalledWith({
            where: [{ accountId: 'buyer', paymentId: 'refund-payment', type: 'CREDIT', roundingOperationId: IsNull() }],
        });
    });
});
