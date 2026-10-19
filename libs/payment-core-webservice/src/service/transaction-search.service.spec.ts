import { Test } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { EntityOwnershipService } from '@ubs-platform/users-microservice-helper';
import { Payment, SellerPaymentOrder } from '@tk-postral/postral-entities';
import { SellerPaymentOrderSearchService } from './transaction-search.service';
import { TransactionMapper } from '../mapper/transaction.mapper';
import { AccountMapper } from '../mapper/account.mapper';
import { AccountService } from './account.service';
import { AuthUtilService } from './auth-util.service';

describe('Seller order external platform metadata', () => {
    const orders = { find: jest.fn(), findOneBy: jest.fn(), findOne: jest.fn() };
    const payments = { find: jest.fn() };
    let service: SellerPaymentOrderSearchService;

    beforeEach(async () => {
        jest.clearAllMocks();
        const module = await Test.createTestingModule({
            providers: [
                SellerPaymentOrderSearchService,
                { provide: getRepositoryToken(SellerPaymentOrder), useValue: orders },
                { provide: getRepositoryToken(Payment), useValue: payments },
                { provide: TransactionMapper, useValue: { toDto: order => ({ ...order }) } },
                { provide: EntityOwnershipService, useValue: {} },
                { provide: AccountMapper, useValue: {} },
                { provide: AccountService, useValue: {} },
                { provide: AuthUtilService, useValue: {} },
            ],
        }).compile();
        service = module.get(SellerPaymentOrderSearchService);
        payments.find.mockResolvedValue([
            { id: 'external', externalPlatformId: 'platform' },
            { id: 'normal' },
        ]);
    });

    it('marks only external orders with one batched parent-payment lookup', async () => {
        orders.find.mockResolvedValue([
            { id: 'order-1', paymentId: 'external' },
            { id: 'order-2', paymentId: 'normal' },
            { id: 'order-3', paymentId: 'external' },
        ]);
        const result = await service.findAll({ admin: 'true' });
        expect(result.map(order => order.externalPlatformId)).toEqual(['platform', undefined, 'platform']);
        expect(payments.find).toHaveBeenCalledTimes(1);
        expect(payments.find).toHaveBeenCalledWith(expect.objectContaining({
            select: ['id', 'externalPlatformId'], loadEagerRelations: false,
        }));
    });

    it('includes external metadata in seller-order detail', async () => {
        orders.findOneBy.mockResolvedValue({ id: 'order', paymentId: 'external' });
        expect(await service.fetchById('order')).toMatchObject({ externalPlatformId: 'platform' });
    });

    it('does not query parent payments for empty lists', async () => {
        orders.find.mockResolvedValue([]);
        expect(await service.findAll({ admin: 'true' })).toEqual([]);
        expect(payments.find).not.toHaveBeenCalled();
    });
});
