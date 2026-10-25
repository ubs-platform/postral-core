import { createHmac } from 'node:crypto';
import { IyzicoClientService } from './iyzico-client.service';
import type { mapCheckout } from './iyzico-checkout.mapper';

type SdkCallback = (error: Error | null, result: unknown) => void;
const mockCreate = jest.fn<void, [object, SdkCallback]>();
const mockRetrieve = jest.fn<void, [object, SdkCallback]>();

jest.mock('iyzipay', () => ({
    __esModule: true,
    default: jest.fn().mockImplementation(() => ({
        checkoutFormInitialize: {
            create: (request: object, callback: SdkCallback) =>
                mockCreate(request, callback),
        },
        checkoutForm: {
            retrieve: (request: object, callback: SdkCallback) =>
                mockRetrieve(request, callback),
        },
    })),
}));

describe('IyzicoClientService SDK boundary', () => {
    const originalEnv = { ...process.env };
    let client: IyzicoClientService;
    const request: ReturnType<typeof mapCheckout> = {
        locale: 'tr',
        conversationId: 'operation',
        basketId: 'basket',
        price: '10.00',
        paidPrice: '10.00',
        currency: 'TRY',
        paymentGroup: 'PRODUCT',
        callbackUrl: 'https://app.test/callback',
        enabledInstallments: [1],
        buyer: {
            id: 'buyer',
            name: 'Test',
            surname: 'Buyer',
            email: 'buyer@example.test',
            gsmNumber: undefined,
            identityNumber: '74300864791',
            registrationAddress: 'Street',
            ip: '85.34.78.112',
            city: 'Istanbul',
            country: 'Turkey',
            zipCode: '34732',
        },
        billingAddress: {
            contactName: 'Test Buyer',
            city: 'Istanbul',
            country: 'Turkey',
            address: 'Street',
            zipCode: '34732',
        },
        basketItems: [
            {
                id: 'payment-item',
                name: 'Book',
                category1: 'Digital books',
                itemType: 'VIRTUAL',
                price: '10.00',
            },
        ],
    };
    function signature(values: string[]): string {
        return createHmac('sha256', 'test-secret')
            .update(values.join(':'))
            .digest('hex');
    }
    function initialized(changes: Record<string, unknown> = {}) {
        return {
            status: 'success',
            conversationId: 'operation',
            token: 'checkout-token',
            signature: signature(['operation', 'checkout-token']),
            paymentPageUrl: 'https://sandbox-cpp.iyzipay.com/form',
            ...changes,
        };
    }
    function retrieved(changes: Record<string, unknown> = {}) {
        return {
            status: 'success',
            paymentStatus: 'SUCCESS',
            paymentId: 'provider-payment',
            currency: 'TRY',
            basketId: 'basket',
            conversationId: 'operation',
            price: '10.00',
            paidPrice: 10,
            token: 'checkout-token',
            signature: signature([
                'SUCCESS',
                'provider-payment',
                'TRY',
                'basket',
                'operation',
                '10',
                '10',
                'checkout-token',
            ]),
            ...changes,
        };
    }

    beforeEach(() => {
        process.env = {
            ...originalEnv,
            NODE_ENV: 'test',
            IYZIPAY_API_KEY: 'test-key',
            IYZIPAY_SECRET_KEY: 'test-secret',
            IYZIPAY_URI: 'https://sandbox-api.iyzipay.com',
            IYZICO_PUBLIC_BASE_URL:
                'https://app.test/service/payment/api/iyzico/',
        };
        mockCreate.mockReset();
        mockRetrieve.mockReset();
        client = new IyzicoClientService();
    });

    afterEach(() => {
        process.env = { ...originalEnv };
        jest.useRealTimers();
    });

    it('verifies initialization and retrieves a result with normalized signed prices', async () => {
        mockCreate.mockImplementation((_data, callback) =>
            callback(null, initialized()),
        );
        expect(await client.initialize(request)).toEqual({
            token: 'checkout-token',
            paymentPageUrl: 'https://sandbox-cpp.iyzipay.com/form',
        });
        mockRetrieve.mockImplementation((_data, callback) =>
            callback(null, retrieved()),
        );
        expect(
            await client.retrieve('checkout-token', 'operation'),
        ).toMatchObject({
            paymentId: 'provider-payment',
            paymentStatus: 'SUCCESS',
        });
        expect(mockRetrieve.mock.calls[0][0]).toEqual({
            locale: 'tr',
            conversationId: 'operation',
            token: 'checkout-token',
        });
    });

    it.each([
        { signature: undefined },
        { signature: '0'.repeat(64) },
        { paymentPageUrl: 'https://iyzipay.com.attacker.test/form' },
        { paymentPageUrl: 'https://attacker.test/form' },
        { paymentPageUrl: 'http://sandbox-cpp.iyzipay.com/form' },
        {
            conversationId: 'wrong',
            signature: signature(['wrong', 'checkout-token']),
        },
    ])('rejects invalid initialization: %j', async (change) => {
        mockCreate.mockImplementation((_data, callback) =>
            callback(null, initialized(change)),
        );
        await expect(client.initialize(request)).rejects.toThrow();
    });

    it.each([
        { paidPrice: 11 },
        { token: 'wrong' },
        { status: 'failure', errorCode: '10000' },
        { signature: undefined },
    ])('rejects tampered or failed retrieval: %j', async (change) => {
        mockRetrieve.mockImplementation((_data, callback) =>
            callback(null, retrieved(change)),
        );
        await expect(
            client.retrieve('checkout-token', 'operation'),
        ).rejects.toThrow();
    });

    it('rejects a validly signed result for another operation', async () => {
        mockRetrieve.mockImplementation((_data, callback) =>
            callback(
                null,
                retrieved({
                    conversationId: 'another',
                    signature: signature([
                        'SUCCESS',
                        'provider-payment',
                        'TRY',
                        'basket',
                        'another',
                        '10',
                        '10',
                        'checkout-token',
                    ]),
                }),
            ),
        );
        await expect(
            client.retrieve('checkout-token', 'operation'),
        ).rejects.toThrow('correlation mismatch');
    });

    it('surfaces transport errors without exposing raw error details', async () => {
        mockCreate.mockImplementation((_data, callback) =>
            callback(new Error('sensitive transport body'), undefined),
        );
        await expect(client.initialize(request)).rejects.toThrow(
            'transport failed',
        );
    });

    it('times out ambiguous calls without retrying them', async () => {
        jest.useFakeTimers();
        const promise = client.initialize(request);
        const rejection = expect(promise).rejects.toThrow('timed out');
        await jest.advanceTimersByTimeAsync(20_000);
        await rejection;
        expect(mockCreate).toHaveBeenCalledTimes(1);
    });

    it('refuses live endpoints, production mode and missing credentials', () => {
        process.env.IYZIPAY_URI = 'https://api.iyzipay.com';
        expect(() => new IyzicoClientService()).toThrow('Only https://sandbox');
        process.env.IYZIPAY_URI = 'https://sandbox-api.iyzipay.com';
        process.env.NODE_ENV = 'production';
        expect(() => new IyzicoClientService()).toThrow('sandbox-only');
        process.env.NODE_ENV = 'test';
        delete process.env.IYZIPAY_SECRET_KEY;
        expect(() => new IyzicoClientService()).toThrow('required');
    });
});
