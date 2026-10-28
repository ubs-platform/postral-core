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

describe('Payment operation return URL', () => {
    let service: PaymentOperationManagementService;
    const repo = { find: jest.fn(), save: jest.fn() };
    const channel = { initializePaymentChannelOperation: jest.fn() };
    const settings = { getAdminSettings: jest.fn() };
    const payment = {
        id: 'payment',
        type: 'PURCHASE',
        totalAmount: 10,
        captureInfo: {
            paymentChannelId: 'dummy-ecommerce',
            paidAmount: 10,
            currency: 'TRY',
            redirectUrl: 'https://app.example.com/payment-return?x=1',
        },
    } as any;

    beforeEach(async () => {
        jest.resetAllMocks();
        repo.find.mockResolvedValue([]);
        repo.save.mockImplementation(async value => value);
        settings.getAdminSettings.mockResolvedValue({ allowedReturnOrigins: [] });
        channel.initializePaymentChannelOperation.mockResolvedValue({
            paymentChannelId: 'dummy-ecommerce',
            paymentChannelOperationId: 'channel-op',
            redirectUrl: 'dummy-ecommerce-payment-channel/operation/channel-op',
            paymentStatus: 'WAITING',
        });
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

    it('stores the frontend URL and points the channel to the Postral return endpoint', async () => {
        const result = await service.startPaymentOperation(structuredClone(payment));

        const saved: PaymentChannelOperation = repo.save.mock.calls[0][0];
        expect(saved.returnUrl).toBe('https://app.example.com/payment-return?x=1');
        expect(saved.id).toMatch(/^[0-9a-f-]{36}$/);
        expect(result.redirectUrl).toBe(
            '/service/payment/api/dummy-ecommerce-payment-channel/operation/channel-op?redirectUrl='
            + encodeURIComponent(`/service/payment/api/payment/operation/${saved.id}/return`),
        );
        expect(channel.initializePaymentChannelOperation.mock.calls[0][1].captureInfo.redirectUrl).toBeUndefined();
    });

    it('keeps the legacy channel URL when no frontend URL is given', async () => {
        const legacy = structuredClone(payment);
        delete legacy.captureInfo.redirectUrl;

        const result = await service.startPaymentOperation(legacy);

        expect(result.redirectUrl).toBe('dummy-ecommerce-payment-channel/operation/channel-op');
        expect(repo.save.mock.calls[0][0].returnUrl).toBeUndefined();
    });

    it('rejects a non-whitelisted frontend URL in production before calling the channel', async () => {
        const env = process.env.NODE_ENV;
        process.env.NODE_ENV = 'production';
        try {
            settings.getAdminSettings.mockResolvedValue({ allowedReturnOrigins: ['https://other.example.com'] });
            await expect(service.startPaymentOperation(structuredClone(payment)))
                .rejects.toThrow('redirectUrl origin is not allowed');
            expect(channel.initializePaymentChannelOperation).not.toHaveBeenCalled();
        } finally {
            process.env.NODE_ENV = env;
        }
    });

    it('builds the redirect target with the payment result', async () => {
        const operation = Object.assign(new PaymentChannelOperation(), {
            id: 'op-1', paymentId: 'payment', returnUrl: 'https://app.example.com/payment-return?x=1',
        });

        await expect(service.buildReturnTarget(operation, 'COMPLETED')).resolves.toBe(
            'https://app.example.com/payment-return?x=1&paymentId=payment&operationId=op-1&status=COMPLETED',
        );
    });
});
