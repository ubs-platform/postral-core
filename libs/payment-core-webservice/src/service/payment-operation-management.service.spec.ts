import { Test } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { PaymentChannelOperation } from '@tk-postral/postral-entities';
import { PaymentChannelStatusDTO } from '@tk-postral/payment-common';
import { PaymentOperationManagementService } from './payment-operation-management.service';
import { EventSenderService } from './event-management.service';
import { OrderCalculationService } from './order-calculation.service';
import { AdminSettingsService } from './admin-settings.service';

describe('Payment operation capture fees', () => {
    let service: PaymentOperationManagementService;
    let operation: PaymentChannelOperation;
    let result: PaymentChannelStatusDTO;
    const repo = { find: jest.fn(), save: jest.fn() };
    const channel = { paymentChannelFireIfAuthorized: jest.fn() };
    const settings = { getAdminSettings: jest.fn() };

    beforeEach(async () => {
        jest.resetAllMocks();
        operation = Object.assign(new PaymentChannelOperation(), {
            id: 'operation',
            operationId: 'provider-operation',
            paymentId: 'payment',
            paymentChannelId: 'channel',
            status: 'READY',
            amount: 342,
            currency: 'TRY',
            providerFee: 1,
        });
        result = Object.assign(new PaymentChannelStatusDTO(), {
            paymentChannelId: 'channel',
            paymentChannelOperationId: 'provider-operation',
            paymentStatus: 'COMPLETED',
            providerFee: 4.01,
            feeCutInstantly: true,
        });
        repo.find.mockResolvedValue([operation]);
        repo.save.mockImplementation(async value => value);
        channel.paymentChannelFireIfAuthorized.mockImplementation(async () => result);
        settings.getAdminSettings.mockResolvedValue({ sellerPaysPaymentServiceFee: false });
        const module = await Test.createTestingModule({
            providers: [
                PaymentOperationManagementService,
                { provide: getRepositoryToken(PaymentChannelOperation), useValue: repo },
                { provide: EventSenderService, useValue: channel },
                { provide: OrderCalculationService, useValue: {} },
                { provide: AdminSettingsService, useValue: settings },
            ],
        }).compile();
        service = module.get(PaymentOperationManagementService);
    });

    it('saves actual capture fees and fee timing from the completed response', async () => {
        await service.firePaymentOperationsByPaymentId('payment');

        expect(repo.find).toHaveBeenCalledWith({
            where: [{ paymentId: 'payment', status: 'READY' }],
        });
        expect(channel.paymentChannelFireIfAuthorized).toHaveBeenCalledWith('channel', 'provider-operation');
        expect(repo.save).toHaveBeenCalledWith(expect.objectContaining({
            status: 'COMPLETED',
            providerFee: 4.01,
            feeCutInstantly: true,
            providerFeeDebitFrom: 'PLATFORM',
        }));
    });

    it('accepts explicit zero fees and false fee timing, with seller-paid fees', async () => {
        operation.feeCutInstantly = true;
        result.providerFee = 0;
        result.feeCutInstantly = false;
        settings.getAdminSettings.mockResolvedValue({ sellerPaysPaymentServiceFee: true });

        await service.firePaymentOperationsByPaymentId('payment');

        expect(repo.save).toHaveBeenCalledWith(expect.objectContaining({
            providerFee: 0,
            feeCutInstantly: false,
            providerFeeDebitFrom: 'SELLER',
        }));
    });

    it('preserves existing fee information when the channel omits it', async () => {
        operation.feeCutInstantly = true;
        delete result.providerFee;
        delete result.feeCutInstantly;

        await service.firePaymentOperationsByPaymentId('payment');

        expect(repo.save).toHaveBeenCalledWith(expect.objectContaining({
            status: 'COMPLETED',
            providerFee: 1,
            feeCutInstantly: true,
        }));
    });

    it('does not save a capture response that is not completed', async () => {
        result.paymentStatus = 'WAITING';

        await expect(service.firePaymentOperationsByPaymentId('payment'))
            .rejects.toThrow('could not be completed');

        expect(repo.save).not.toHaveBeenCalled();
        expect(operation.status).toBe('READY');
    });
});
