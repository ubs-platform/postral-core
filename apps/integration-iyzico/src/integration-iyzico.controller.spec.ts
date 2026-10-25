import { Test } from '@nestjs/testing';
import {
    FastifyAdapter,
    NestFastifyApplication,
} from '@nestjs/platform-fastify';
import { IntegrationIyzicoController } from './integration-iyzico.controller';
import { IntegrationIyzicoService } from './integration-iyzico.service';
import { IyzicoOperation } from './iyzico-operation.entity';

describe('IntegrationIyzicoController HTTP', () => {
    let app: NestFastifyApplication;
    const service = {
        launch: jest.fn(),
        callback: jest.fn(),
        notify: jest.fn(),
        returnUrl: jest.fn(),
        toStatus: jest.fn(),
    };

    beforeEach(async () => {
        jest.resetAllMocks();
        const module = await Test.createTestingModule({
            controllers: [IntegrationIyzicoController],
            providers: [
                { provide: IntegrationIyzicoService, useValue: service },
            ],
        }).compile();
        app = module.createNestApplication<NestFastifyApplication>(
            new FastifyAdapter({ bodyLimit: 4096 }),
        );
        app.setGlobalPrefix('api');
        await app.init();
        await app.getHttpAdapter().getInstance().ready();
    });

    afterEach(async () => {
        await app.close();
    });

    it('reports sandbox mode', async () => {
        const response = await app.inject({
            method: 'GET',
            url: '/api/iyzico/health',
        });
        expect(response.statusCode).toBe(200);
        expect(response.json()).toEqual({ mode: 'sandbox' });
    });

    it('uses a no-store redirect to the hosted checkout', async () => {
        service.launch.mockResolvedValue(
            'https://sandbox-cpp.iyzipay.com/form',
        );
        const response = await app.inject({
            method: 'GET',
            url: '/api/iyzico/operation/op?redirectUrl=https%3A%2F%2Fapp.test%2Freturn',
        });
        expect(response.statusCode).toBe(302);
        expect(response.headers.location).toBe(
            'https://sandbox-cpp.iyzipay.com/form',
        );
        expect(response.headers['cache-control']).toBe('no-store');
        expect(service.launch).toHaveBeenCalledWith(
            'op',
            'https://app.test/return',
        );
    });

    it('notifies after persisting the callback result and returns with HTTP 303', async () => {
        const operation = Object.assign(new IyzicoOperation(), {
            id: 'op',
            status: 'COMPLETED',
        });
        service.callback.mockResolvedValue(operation);
        service.notify.mockResolvedValue(undefined);
        service.returnUrl.mockReturnValue(
            'https://app.test/return?status=COMPLETED',
        );
        const response = await app.inject({
            method: 'POST',
            url: '/api/iyzico/callback/op',
            payload: { token: 'token' },
        });
        expect(response.statusCode).toBe(303);
        expect(response.headers.location).toBe(
            'https://app.test/return?status=COMPLETED',
        );
        expect(service.callback).toHaveBeenCalledWith('op', 'token');
        expect(service.notify).toHaveBeenCalledWith('op');
        expect(service.callback.mock.invocationCallOrder[0]).toBeLessThan(
            service.notify.mock.invocationCallOrder[0],
        );
    });

    it('does not publish success or redirect when verification fails', async () => {
        service.callback.mockRejectedValue(new Error('Signature failed'));
        const response = await app.inject({
            method: 'POST',
            url: '/api/iyzico/callback/op',
            payload: { token: 'token' },
        });
        expect(response.statusCode).toBe(500);
        expect(service.notify).not.toHaveBeenCalled();
        expect(response.headers.location).toBeUndefined();
    });

    it('parses the actual form-encoded iyzico callback and bounds its size', async () => {
        const operation = Object.assign(new IyzicoOperation(), {
            id: 'op',
            status: 'WAITING',
        });
        service.callback.mockResolvedValue(operation);
        service.notify.mockResolvedValue(undefined);
        service.returnUrl.mockReturnValue(null);
        service.toStatus.mockReturnValue({ paymentStatus: 'WAITING' });
        const response = await app.inject({
            method: 'POST',
            url: '/api/iyzico/callback/op',
            headers: { 'content-type': 'application/x-www-form-urlencoded' },
            payload: 'token=checkout%2Btoken&status=SUCCESS',
        });
        expect(response.statusCode).toBe(201);
        expect(service.callback).toHaveBeenCalledWith('op', 'checkout+token');
        expect(response.json()).toEqual({ paymentStatus: 'WAITING' });
        const oversized = await app.inject({
            method: 'POST',
            url: '/api/iyzico/callback/op',
            headers: { 'content-type': 'application/x-www-form-urlencoded' },
            payload: 'token=' + 'x'.repeat(5000),
        });
        expect(oversized.statusCode).toBe(413);
    });
});
