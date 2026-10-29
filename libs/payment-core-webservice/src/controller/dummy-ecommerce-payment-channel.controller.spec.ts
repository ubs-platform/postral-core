import { Test } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { DummyEcommerceOperation } from '@tk-postral/postral-entities';
import { DummyEcommercePaymentChannelController } from './dummy-ecommerce-payment-channel.controller';

describe('Dummy channel refund preparation', () => {
    it('explicitly retains amount-only refund handling without precision plans or side effects', async () => {
        const repository = { upsert: jest.fn(), findOne: jest.fn() };
        const transport = { emit: jest.fn() };
        const module = await Test.createTestingModule({
            controllers: [DummyEcommercePaymentChannelController],
            providers: [
                { provide: getRepositoryToken(DummyEcommerceOperation), useValue: repository },
                { provide: 'MICROSERVICE_CLIENT', useValue: transport },
            ],
        }).compile();
        expect(module.get(DummyEcommercePaymentChannelController).prepareRefund()).toEqual({ plans: [] });
        expect(repository.upsert).not.toHaveBeenCalled();
        expect(transport.emit).not.toHaveBeenCalled();
    });
});
