import { Test } from '@nestjs/testing';
import {
    FastifyAdapter,
    NestFastifyApplication,
} from '@nestjs/platform-fastify';
import { PaymentController } from './payment.controller';
import { PaymentService } from '../service/payment.service';
import { AccountService } from '../service/account.service';
import { PaymentChannelConfigService } from '../service/payment-channel-config.service';
import { ExternalPlatformPaymentService } from '../service/external-platform-payment.service';

describe('PaymentController checkout IP context', () => {
    it('overwrites body IP and ignores untrusted forwarding headers', async () => {
        const startPaymentOperation = jest
            .fn()
            .mockResolvedValue({ paymentStatus: 'WAITING' });
        const module = await Test.createTestingModule({
            controllers: [PaymentController],
            providers: [
                {
                    provide: PaymentService,
                    useValue: {
                        startPaymentOperation,
                        hasOngoingPaymentOperations: jest
                            .fn()
                            .mockResolvedValue(false),
                        failPaymentIfSetFailFieldTrue: jest.fn(),
                    },
                },
                { provide: AccountService, useValue: {} },
                { provide: ExternalPlatformPaymentService, useValue: {} },
                {
                    provide: PaymentChannelConfigService,
                    useValue: {
                        fetchAll: jest.fn().mockResolvedValue({
                            content: [
                                {
                                    channelId: 'iyzico',
                                    enabled: true,
                                    devOnly: false,
                                },
                            ],
                        }),
                    },
                },
            ],
        }).compile();
        const app = module.createNestApplication<NestFastifyApplication>(
            new FastifyAdapter(),
        );
        await app.init();
        await app.getHttpAdapter().getInstance().ready();
        try {
            const response = await app.inject({
                method: 'POST',
                url: '/payment/payment-id/operation/start',
                headers: { 'x-forwarded-for': '198.51.100.10' },
                payload: {
                    paymentChannelId: 'iyzico',
                    paidAmount: 10,
                    currency: 'EUR',
                    buyerIp: '203.0.113.10',
                },
            });
            expect(response.statusCode).toBe(201);
            expect(startPaymentOperation).toHaveBeenCalledWith('payment-id', {
                paymentChannelId: 'iyzico',
                paidAmount: 10,
                currency: 'EUR',
                buyerIp: '127.0.0.1',
            });
        } finally {
            await app.close();
        }
    });

    it('checks the payment and redirects the browser to the stored frontend URL', async () => {
        const resolveOperationReturnUrl = jest
            .fn()
            .mockResolvedValue('https://app.example.com/return?status=COMPLETED');
        const module = await Test.createTestingModule({
            controllers: [PaymentController],
            providers: [
                { provide: PaymentService, useValue: { resolveOperationReturnUrl } },
                { provide: AccountService, useValue: {} },
                { provide: ExternalPlatformPaymentService, useValue: {} },
                { provide: PaymentChannelConfigService, useValue: {} },
            ],
        }).compile();
        const app = module.createNestApplication<NestFastifyApplication>(
            new FastifyAdapter(),
        );
        await app.init();
        await app.getHttpAdapter().getInstance().ready();
        try {
            const id = '0b6f7c1e-3c1a-4a3e-9d0f-6a2b1c3d4e5f';
            const response = await app.inject({
                method: 'GET',
                url: `/payment/operation/${id}/return`,
            });
            expect(response.statusCode).toBe(302);
            expect(response.headers.location).toBe('https://app.example.com/return?status=COMPLETED');
            expect(response.headers['cache-control']).toBe('no-store');
            expect(resolveOperationReturnUrl).toHaveBeenCalledWith(id);

            const invalid = await app.inject({
                method: 'GET',
                url: '/payment/operation/not-a-uuid/return',
            });
            expect(invalid.statusCode).toBe(404);
            expect(resolveOperationReturnUrl).toHaveBeenCalledTimes(1);
        } finally {
            await app.close();
        }
    });
});
