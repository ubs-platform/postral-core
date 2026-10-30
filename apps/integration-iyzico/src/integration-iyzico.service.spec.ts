import { Test } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { QueryFailedError, FindOperator } from 'typeorm';
import { of } from 'rxjs';
import { createHmac } from 'node:crypto';
import type { PaymentFullWithCaptureInfoDTO } from '@tk-postral/payment-common';
import { IntegrationIyzicoService } from './integration-iyzico.service';
import { IyzicoOperation } from './iyzico-operation.entity';
import {
    IyzicoClientService,
    verifyResponseSignature,
    responseDecimal,
} from './iyzico-client.service';
import { mapCheckout } from './iyzico-checkout.mapper';
import { IyzicoRefundService } from './iyzico-refund.service';
import { IyzicoSubMerchantService } from './iyzico-sub-merchant.service';

function payment(): PaymentFullWithCaptureInfoDTO {
    return {
        id: 'postral-payment',
        type: 'PURCHASE',
        totalAmount: 10,
        taxAmount: 0,
        customerAccountId: 'customer',
        paymentChannelId: 'iyzico',
        paymentStatus: 'INITIATED',
        errorStatus: undefined,
        currency: 'TRY',
        taxes: [],
        captureInfo: {
            paymentChannelId: 'iyzico',
            paidAmount: 10,
            currency: 'TRY',
            buyerIp: '85.34.78.112',
        },
        customerSnapshotAccount: {
            id: 'snapshot-account',
            type: 'INDIVIDUAL',
            name: 'Test Buyer',
            legalIdentity: '74300864791',
            emailAddress: 'buyer@example.test',
        },
        customerSnapshotAddress: {
            name: 'Home',
            streetName: 'Test street',
            citySubdivisionName: 'Kadikoy',
            cityName: 'Istanbul',
            country: 'TR',
            countryReadName: 'Turkey',
            postalZone: '34732',
        },
        items: [
            {
                id: 'payment-item',
                itemId: 'catalog-book',
                name: 'Digital book',
                quantity: 1,
                totalAmount: 10,
                taxPercent: 0,
                taxAmount: 0,
                variation: 'default',
                unTaxAmount: 10,
                originalUnitAmount: 10,
                unitAmount: 10,
                unit: 'C62',
                appComissionPercent: 0,
                appComissionAmount: 0,
                entityGroup: 'LOTUS_QB',
                entityName: 'QUESTION_BOOK',
                entityId: 'book',
            },
        ],
    };
}

describe('iyzico checkout mapping', () => {
    it.each(['TRY', 'USD', 'EUR', 'GBP', 'NOK', 'CHF'])(
        'preserves %s and payment-item identities',
        (currency) => {
            const input = payment();
            input.currency = currency;
            input.captureInfo.currency = currency;
            const result = mapCheckout(
                input,
                'adapter-id',
                'https://app.test/callback',
            );
            expect(result).toMatchObject({
                conversationId: 'adapter-id',
                basketId: input.id,
                currency,
                price: '10.00',
                paidPrice: '10.00',
                enabledInstallments: [1],
                buyer: { name: 'Test', surname: 'Buyer', ip: '85.34.78.112' },
                basketItems: [
                    { id: 'payment-item', itemType: 'VIRTUAL', price: '10.00' },
                ],
            });
            expect(result.basketItems[0].id).not.toBe(input.items[0].itemId);
            expect(result).not.toHaveProperty('paymentCard');
            expect(result.basketItems[0]).not.toHaveProperty('subMerchantKey');
        },
    );

    it.each([
        [
            'missing identity',
            (input: PaymentFullWithCaptureInfoDTO) => {
                input.customerSnapshotAccount!.legalIdentity = '';
            },
        ],
        [
            'missing email',
            (input: PaymentFullWithCaptureInfoDTO) => {
                input.customerSnapshotAccount!.emailAddress = '';
            },
        ],
        [
            'missing IP',
            (input: PaymentFullWithCaptureInfoDTO) => {
                delete input.captureInfo.buyerIp;
            },
        ],
        [
            'missing surname',
            (input: PaymentFullWithCaptureInfoDTO) => {
                input.customerSnapshotAccount!.name = 'Buyer';
            },
        ],
        [
            'commercial buyer',
            (input: PaymentFullWithCaptureInfoDTO) => {
                input.customerSnapshotAccount!.type = 'COMMERCIAL';
            },
        ],
        [
            'refund',
            (input: PaymentFullWithCaptureInfoDTO) => {
                input.type = 'REFUND';
            },
        ],
        [
            'partial capture',
            (input: PaymentFullWithCaptureInfoDTO) => {
                input.captureInfo.paidAmount = 5;
            },
        ],
        [
            'currency mismatch',
            (input: PaymentFullWithCaptureInfoDTO) => {
                input.captureInfo.currency = 'USD';
            },
        ],
        [
            'fractional cents',
            (input: PaymentFullWithCaptureInfoDTO) => {
                input.items[0].totalAmount = 9.999;
            },
        ],
        [
            'mismatched totals',
            (input: PaymentFullWithCaptureInfoDTO) => {
                input.items[0].totalAmount = 9;
            },
        ],
        [
            'duplicate line IDs',
            (input: PaymentFullWithCaptureInfoDTO) => {
                input.items[0].totalAmount = 5;
                input.items.push({ ...input.items[0] });
            },
        ],
    ])('rejects %s instead of fabricating data', (_name, change) => {
        const input = payment();
        change(input);
        expect(() =>
            mapCheckout(input, 'adapter-id', 'https://app.test/callback'),
        ).toThrow();
    });

    it.each([
        ['Ayse YILMAZ DEMIR', 'Ayse', 'YILMAZ DEMIR'],
        ['Ayşe YILMAZ DEMİR', 'Ayşe', 'YILMAZ DEMİR'],
        ['Işıl AKIN YILDIZ', 'Işıl', 'AKIN YILDIZ'],
        ['  Ayşe   Nur  YILMAZ  DEMİR  ', 'Ayşe Nur', 'YILMAZ DEMİR'],
        ['Ayşe Yılmaz Demir', 'Ayşe Yılmaz', 'Demir'],
        ['Ayşe YILMAZ Demir', 'Ayşe YILMAZ', 'Demir'],
        ['Ayşe Yılmaz DEMİR', 'Ayşe Yılmaz', 'DEMİR'],
        ['AYŞE DEMİR', 'AYŞE', 'DEMİR'],
        ['Ayşe 123 DEMİR', 'Ayşe 123', 'DEMİR'],
        ['Ayşe --- DEMİR', 'Ayşe ---', 'DEMİR'],
    ])(
        'splits "%s" into name "%s" and surname "%s"',
        (fullName, name, surname) => {
            const input = payment();
            input.customerSnapshotAccount!.name = fullName;
            expect(
                mapCheckout(input, 'adapter-id', 'https://app.test/callback')
                    .buyer,
            ).toMatchObject({ name, surname });
        },
    );

    it('routes seller items to their sub-merchant at the full line price', () => {
        const input = payment();
        input.items[0].sellerAccountId = 'seller-1';
        const result = mapCheckout(
            input,
            'adapter-id',
            'https://app.test/callback',
            new Map([['seller-1', 'key-seller-1']]),
        );
        expect(result.basketItems[0]).toMatchObject({
            subMerchantKey: 'key-seller-1',
            subMerchantPrice: '10.00',
        });
    });

    it('rejects a seller item without a resolved sub-merchant key', () => {
        const input = payment();
        input.items[0].sellerAccountId = 'seller-1';
        expect(() =>
            mapCheckout(input, 'adapter-id', 'https://app.test/callback'),
        ).toThrow('sub-merchant key');
    });

    it('keeps legacy items VIRTUAL regardless of their entity family', () => {
        const input = payment();
        input.items[0].entityGroup = 'OTHER_APP';
        input.items[0].entityName = 'OTHER_PRODUCT';
        input.items[0].name = 'Another product';
        const result = mapCheckout(
            input,
            'adapter-id',
            'https://app.test/callback',
        );
        expect(result.basketItems[0]).toMatchObject({
            id: 'payment-item',
            name: 'Another product',
            category1: 'Digital products',
            itemType: 'VIRTUAL',
        });
        expect(result).not.toHaveProperty('shippingAddress');
    });

    it.each([false, true])('maps physical items with shipping (mixed basket: %s)', (mixed) => {
        const input = payment();
        input.items[0].isPhysical = true;
        input.items[0].metaEntityGroup = 'CATALOG';
        input.items[0].metaEntityName = 'LAPTOP';
        input.items[0].metaEntityId = 'Thinkpad-E14';
        if (mixed) {
            input.items[0].totalAmount = 5;
            input.items.push({
                ...input.items[0], id: 'digital-line', isPhysical: false, totalAmount: 5,
            });
        }
        const result = mapCheckout(input, 'adapter-id', 'https://app.test/callback');
        expect(result.shippingAddress).toEqual(result.billingAddress);
        expect(result.shippingAddress).toMatchObject({
            address: 'Test street Kadikoy', city: 'Istanbul', country: 'Turkey',
        });
        expect(result.basketItems[0]).toMatchObject({
            id: 'payment-item', itemType: 'PHYSICAL', category1: 'Physical products',
        });
        expect(result.basketItems[0]).not.toHaveProperty('metaEntityId');
        if (mixed) {
            expect(result.basketItems[1].itemType).toBe('VIRTUAL');
        }
    });

    it('does not send shipping for explicitly virtual items', () => {
        const input = payment();
        input.items[0].isPhysical = false;
        expect(mapCheckout(input, 'adapter-id', 'https://app.test/callback'))
            .not.toHaveProperty('shippingAddress');
    });

    it('rejects physical checkout without a valid customer address snapshot', () => {
        const input = payment();
        input.items[0].isPhysical = true;
        input.customerSnapshotAddress = undefined;
        expect(() => mapCheckout(input, 'adapter-id', 'https://app.test/callback'))
            .toThrow('customerSnapshotAddress.streetName');
    });

    it('rejects non-boolean physical flags rather than treating strings as truthy', () => {
        const input = payment();
        Object.assign(input.items[0], { isPhysical: 'false' });
        expect(() => mapCheckout(input, 'adapter-id', 'https://app.test/callback'))
            .toThrow('isPhysical must be a boolean');
    });
});

describe('iyzico response signatures', () => {
    it('verifies HMAC and fails closed on missing or tampered signatures', () => {
        const values = [
            'SUCCESS',
            'provider-id',
            'TRY',
            'basket',
            'operation',
            '10',
            '10',
            'token',
        ];
        const signature = createHmac('sha256', 'secret')
            .update(values.join(':'))
            .digest('hex');
        expect(() =>
            verifyResponseSignature('secret', values, signature),
        ).not.toThrow();
        expect(() =>
            verifyResponseSignature('wrong-secret', values, signature),
        ).toThrow('verification failed');
        expect(() =>
            verifyResponseSignature('secret', values, undefined),
        ).toThrow('invalid iyzico signature');
        expect(() =>
            verifyResponseSignature('secret', values, 'not-hex'),
        ).toThrow();
    });

    it('normalizes decimal trailing zeros without floating-point rounding', () => {
        expect(responseDecimal('10.5000')).toBe('10.5');
        expect(responseDecimal(10)).toBe('10');
        expect(responseDecimal('999999999999999.99')).toBe(
            '999999999999999.99',
        );
        expect(() => responseDecimal('NaN')).toThrow();
        expect(() => responseDecimal(-1)).toThrow();
    });
});

describe('IntegrationIyzicoService', () => {
    let service: IntegrationIyzicoService;
    const rows = new Map<string, IyzicoOperation>();
    const operations = {
        create: jest.fn((value: Partial<IyzicoOperation>) =>
            Object.assign(
                new IyzicoOperation(),
                {
                    token: null,
                    providerFee: null,
                    providerPaymentId: null,
                    paymentPageUrl: null,
                    itemTransactions: null,
                    returnUrl: null,
                    callbackReceived: false,
                    cancellationState: null,
                },
                value,
            ),
        ),
        insert: jest.fn((value: IyzicoOperation) => {
            if (
                [...rows.values()].some(
                    (row) => row.paymentId === value.paymentId,
                )
            ) {
                throw new QueryFailedError(
                    'INSERT',
                    [],
                    Object.assign(new Error('Duplicate'), {
                        code: 'ER_DUP_ENTRY',
                    }),
                );
            }
            rows.set(value.id, structuredClone(value));
        }),
        findOneBy: jest.fn(({ id }: { id: string }) => {
            const row = rows.get(id);
            return row ? structuredClone(row) : null;
        }),
        findOneByOrFail: jest.fn(({ paymentId }: { paymentId: string }) => {
            const row = [...rows.values()].find(
                (value) => value.paymentId === paymentId,
            );
            if (!row) throw new Error('Missing row');
            return structuredClone(row);
        }),
        update: jest.fn(
            (
                criteria:
                    | string
                    | {
                          id: string;
                          status?: string;
                          returnUrl?: FindOperator<unknown>;
                          cancellationState?: string;
                      },
                value: Partial<IyzicoOperation>,
            ) => {
                const id =
                    typeof criteria === 'string' ? criteria : criteria.id;
                const row = rows.get(id);
                if (!row) throw new Error('Missing row');
                if (
                    typeof criteria !== 'string' &&
                    ((criteria.status && row.status !== criteria.status) ||
                        (criteria.returnUrl && row.returnUrl !== null) ||
                        (criteria.cancellationState &&
                            row.cancellationState !==
                                criteria.cancellationState))
                )
                    return;
                rows.set(id, { ...row, ...value });
            },
        ),
    };
    const client = {
        publicBaseUrl: new URL('https://app.test/service/payment/api/iyzico/'),
        initialize: jest.fn(),
        retrieve: jest.fn(),
    };
    const messages = { emit: jest.fn() };
    const refunds = { initialize: jest.fn(), check: jest.fn(), prepare: jest.fn() };
    const subMerchants = { ensure: jest.fn() };

    function result(
        operationId: string,
        changes: Record<string, unknown> = {},
    ) {
        return {
            paymentId: 'provider-payment',
            conversationId: operationId,
            token: 'checkout-token',
            paymentStatus: 'SUCCESS',
            fraudStatus: 1,
            installment: 1,
            basketId: 'postral-payment',
            currency: 'TRY',
            price: 10,
            paidPrice: 10,
            iyziCommissionRateAmount: '0.25',
            iyziCommissionFee: '0.10',
            itemTransactions: [
                {
                    itemId: 'payment-item',
                    paymentTransactionId: 'provider-transaction',
                    transactionStatus: 1,
                    price: 10,
                    paidPrice: 10,
                },
            ],
            ...changes,
        };
    }

    beforeEach(async () => {
        rows.clear();
        jest.clearAllMocks();
        client.initialize.mockReset().mockResolvedValue({
            token: 'checkout-token',
            paymentPageUrl: 'https://sandbox-cpp.iyzipay.com/form',
        });
        client.retrieve.mockReset();
        refunds.initialize.mockReset().mockRejectedValue(new Error('Invalid iyzico refunds plan'));
        refunds.check.mockReset().mockRejectedValue(new Error('iyzico refund not found'));
        subMerchants.ensure.mockReset().mockImplementation(async (id: string) => `key-${id}`);
        messages.emit.mockReturnValue(of(undefined));
        const module = await Test.createTestingModule({
            providers: [
                IntegrationIyzicoService,
                {
                    provide: getRepositoryToken(IyzicoOperation),
                    useValue: operations,
                },
                { provide: IyzicoClientService, useValue: client },
                { provide: 'MICROSERVICE_CLIENT', useValue: messages },
                { provide: IyzicoRefundService, useValue: refunds },
                { provide: IyzicoSubMerchantService, useValue: subMerchants },
            ],
        }).compile();
        service = module.get(IntegrationIyzicoService);
    });

    it('delegates refund preparation to the refund adapter without initializing a provider operation', async () => {
        const request = { purchasePaymentId: 'purchase', purchaseAmount: 10, currency: 'TRY', captures: [], items: [] };
        const prepared = { plans: [] };
        refunds.prepare.mockResolvedValueOnce(prepared);
        expect(await service.prepareRefund(request)).toBe(prepared);
        expect(refunds.prepare).toHaveBeenCalledWith(request);
        expect(client.initialize).not.toHaveBeenCalled();
    });

    it('reserves before the provider call and reuses an initialized purchase', async () => {
        client.initialize.mockImplementation(() => {
            expect(rows.size).toBe(1);
            expect([...rows.values()][0].initializationState).toBe(
                'INITIALIZING',
            );
            return {
                token: 'checkout-token',
                paymentPageUrl: 'https://sandbox-cpp.iyzipay.com/form',
            };
        });
        const first = await service.initialize(payment());
        const second = await service.initialize(payment());
        expect(first).toEqual(second);
        expect(first.paymentChannelOperationId).not.toBe('postral-payment');
        expect(first.redirectUrl).toBe(
            `/service/payment/api/iyzico/operation/${first.paymentChannelOperationId}`,
        );
        expect(client.initialize).toHaveBeenCalledTimes(1);
        expect(first).not.toHaveProperty('providerFee');
        expect([...rows.values()][0]).not.toHaveProperty('buyer');
    });

    it('ensures each distinct seller once and sends sub-merchant keys to iyzico', async () => {
        const input = payment();
        input.items[0].sellerAccountId = 'seller-1';
        await service.initialize(input);
        expect(subMerchants.ensure).toHaveBeenCalledTimes(1);
        expect(subMerchants.ensure).toHaveBeenCalledWith('seller-1');
        expect(client.initialize.mock.calls[0][0].basketItems[0]).toMatchObject({
            subMerchantKey: 'key-seller-1',
            subMerchantPrice: '10.00',
        });
    });

    it('does not reach iyzico when a seller sub-merchant cannot be ensured', async () => {
        const input = payment();
        input.items[0].sellerAccountId = 'seller-1';
        subMerchants.ensure.mockRejectedValue(new Error('seller incomplete'));
        await expect(service.initialize(input)).rejects.toThrow('seller incomplete');
        expect(client.initialize).not.toHaveBeenCalled();
        expect(rows.size).toBe(0);
    });

    it('never repeats ambiguous initialization and preserves the reservation after restart', async () => {
        client.initialize.mockRejectedValue(new Error('Timeout'));
        await expect(service.initialize(payment())).rejects.toThrow('Timeout');
        expect([...rows.values()][0].initializationState).toBe(
            'RECONCILIATION_REQUIRED',
        );
        await expect(service.initialize(payment())).rejects.toThrow(
            'reconciliation',
        );
        expect(client.initialize).toHaveBeenCalledTimes(1);
    });

    it('rejects changed capture details on a duplicate payment', async () => {
        await service.initialize(payment());
        const changed = payment();
        changed.currency = changed.captureInfo.currency = 'USD';
        await expect(service.initialize(changed)).rejects.toThrow(
            'different capture details',
        );
        expect(client.initialize).toHaveBeenCalledTimes(1);
    });

    it('stays WAITING before callback, and reports unknown operations explicitly', async () => {
        const initialized = await service.initialize(payment());
        expect(
            await service.check(initialized.paymentChannelOperationId),
        ).toMatchObject({ paymentStatus: 'WAITING' });
        expect(client.retrieve).not.toHaveBeenCalled();
        await expect(service.check('missing')).rejects.toThrow('not found');
    });

    it('binds same-origin return URLs, preserves their query/fragment and rejects replacement', async () => {
        const initialized = await service.initialize(payment());
        const id = initialized.paymentChannelOperationId;
        await expect(
            service.launch(id, 'https://attacker.test/return'),
        ).rejects.toThrow('origin');
        await expect(service.launch(id, 'javascript:alert(1)')).rejects.toThrow(
            'origin',
        );
        const back = 'https://app.test/book/return?existing=value#part';
        expect(await service.launch(id, back)).toBe(
            'https://sandbox-cpp.iyzipay.com/form',
        );
        await expect(
            service.launch(id, 'https://app.test/other'),
        ).rejects.toThrow('another return URL');
        expect(service.returnUrl(await service.find(id))).toBe(
            `https://app.test/book/return?existing=value&operationId=${id}&status=WAITING#part`,
        );
    });

    it('stores verified payment/line IDs and actual fees, and never charges again on fire/replay', async () => {
        const initialized = await service.initialize(payment());
        const id = initialized.paymentChannelOperationId;
        client.retrieve.mockResolvedValue(result(id));
        const completed = await service.callback(id, 'checkout-token');
        expect(completed).toMatchObject({
            status: 'COMPLETED',
            providerPaymentId: 'provider-payment',
            providerFee: '0.3500',
            itemTransactions: [
                {
                    paymentItemId: 'payment-item',
                    paymentTransactionId: 'provider-transaction',
                    price: '10',
                    paidPrice: '10',
                },
            ],
        });
        await service.callback(id, 'checkout-token');
        expect(await service.fire(id)).toMatchObject({
            paymentStatus: 'COMPLETED',
            providerFee: 0.35,
        });
        expect(client.retrieve).toHaveBeenCalledTimes(1);
        expect(client.initialize).toHaveBeenCalledTimes(1);
        await service.notify(id);
        expect(messages.emit).toHaveBeenCalledWith(
            'postral/payment-operation-status-updated',
            id,
        );
    });

    it('rejects an invalid callback token without querying the provider', async () => {
        const initialized = await service.initialize(payment());
        await expect(
            service.callback(initialized.paymentChannelOperationId, 'wrong'),
        ).rejects.toThrow('callback token');
        expect(client.retrieve).not.toHaveBeenCalled();
    });

    it.each([
        { currency: 'USD' },
        { price: 11 },
        { paidPrice: 11 },
        { basketId: 'wrong' },
        { itemTransactions: [] },
        { fraudStatus: 'unexpected' },
        { fraudStatus: null },
        { installment: 2 },
        {
            itemTransactions: [
                {
                    itemId: 'catalog-book',
                    paymentTransactionId: 'tx',
                    price: 10,
                    paidPrice: 10,
                },
            ],
        },
    ])('does not complete a mismatched result: %j', async (changes) => {
        const initialized = await service.initialize(payment());
        const id = initialized.paymentChannelOperationId;
        client.retrieve.mockResolvedValue(result(id, changes));
        await expect(service.callback(id, 'checkout-token')).rejects.toThrow();
        expect((await service.find(id)).status).toBe('WAITING');
    });

    it('retries retrieval after a callback error without reinitializing', async () => {
        const initialized = await service.initialize(payment());
        const id = initialized.paymentChannelOperationId;
        client.retrieve
            .mockRejectedValueOnce(new Error('invalid signature'))
            .mockResolvedValue(result(id));
        await expect(service.callback(id, 'checkout-token')).rejects.toThrow(
            'invalid signature',
        );
        expect((await service.find(id)).callbackReceived).toBe(true);
        expect(await service.check(id)).toMatchObject({
            paymentStatus: 'COMPLETED',
        });
        expect(client.initialize).toHaveBeenCalledTimes(1);
    });

    it('does not fulfill a payment while fraud review is pending', async () => {
        const initialized = await service.initialize(payment());
        const id = initialized.paymentChannelOperationId;
        client.retrieve.mockResolvedValue(result(id, { fraudStatus: 0 }));
        expect((await service.callback(id, 'checkout-token')).status).toBe(
            'WAITING',
        );
        client.retrieve.mockResolvedValue(result(id));
        expect(await service.check(id)).toMatchObject({
            paymentStatus: 'COMPLETED',
        });
    });

    it.each([{ fraudStatus: -1 }, { paymentStatus: 'FAILURE' }])(
        'reports provider-declined payments as FAILED: %j',
        async (change) => {
            const initialized = await service.initialize(payment());
            const id = initialized.paymentChannelOperationId;
            client.retrieve.mockResolvedValue(result(id, change));
            expect((await service.callback(id, 'checkout-token')).status).toBe(
                'FAILED',
            );
        },
    );

    it('delegates refunds to their own validator and rejects uncaptured fire without mutating state', async () => {
        const refund = payment();
        refund.type = 'REFUND';
        await expect(service.initialize(refund)).rejects.toThrow('refunds');
        expect(client.initialize).not.toHaveBeenCalled();
        const initialized = await service.initialize(payment());
        const id = initialized.paymentChannelOperationId;
        await expect(service.fire(id)).rejects.toThrow('not captured');
        expect((await service.find(id)).status).toBe('WAITING');
    });

    it('routes refund init/check/fire without invoking checkout or issuing another provider call', async () => {
        const input = payment();
        input.type = 'REFUND';
        const status = {
            paymentChannelId: 'iyzico', paymentChannelOperationId: 'refund-id',
            paymentStatus: 'COMPLETED', redirectUrl: '', refundSettlements: [],
        };
        refunds.initialize.mockResolvedValueOnce(status);
        refunds.check.mockResolvedValue(status);
        expect(await service.initialize(input)).toEqual(status);
        expect(await service.check('refund-id')).toEqual(status);
        expect(await service.fire('refund-id')).toEqual(status);
        await expect(service.cancel('refund-id')).rejects.toThrow('not found');
        expect(refunds.initialize).toHaveBeenCalledTimes(1);
        expect(client.initialize).not.toHaveBeenCalled();
        expect(client.retrieve).not.toHaveBeenCalled();
    });

    it('cancels an unpaid checkout locally and idempotently', async () => {
        const initialized = await service.initialize(payment());
        const id = initialized.paymentChannelOperationId;
        client.retrieve.mockRejectedValue(new Error('iyzico rejected'));
        expect(await service.cancel(id)).toMatchObject({
            paymentStatus: 'FAILED',
        });
        expect(await service.find(id)).toMatchObject({
            status: 'FAILED',
            cancellationState: 'CANCELLED',
        });
        expect(await service.cancel(id)).toMatchObject({
            paymentStatus: 'FAILED',
        });
        expect(client.retrieve).toHaveBeenCalledTimes(1);
    });

    it('cancels when iyzico reports a failed payment', async () => {
        const initialized = await service.initialize(payment());
        const id = initialized.paymentChannelOperationId;
        client.retrieve.mockResolvedValue(
            result(id, { paymentStatus: 'FAILURE' }),
        );
        expect(await service.cancel(id)).toMatchObject({
            paymentStatus: 'FAILED',
        });
    });

    it.each([{ fraudStatus: 1 }, { fraudStatus: 0 }])(
        'refuses to cancel a checkout iyzico reports as paid: %j',
        async (change) => {
            const initialized = await service.initialize(payment());
            const id = initialized.paymentChannelOperationId;
            client.retrieve.mockResolvedValue(result(id, change));
            await expect(service.cancel(id)).rejects.toThrow('reports this checkout as paid');
            expect(await service.find(id)).toMatchObject({
                status: 'WAITING',
                cancellationState: null,
            });
        },
    );

    it('refuses to cancel a captured payment', async () => {
        const initialized = await service.initialize(payment());
        const id = initialized.paymentChannelOperationId;
        client.retrieve.mockResolvedValue(result(id));
        await service.callback(id, 'checkout-token');
        await expect(service.cancel(id)).rejects.toThrow('use a refund');
        expect((await service.find(id)).status).toBe('COMPLETED');
    });

    it('flags a payment completed after cancellation without completing it', async () => {
        const initialized = await service.initialize(payment());
        const id = initialized.paymentChannelOperationId;
        client.retrieve.mockRejectedValueOnce(new Error('iyzico rejected'));
        await service.cancel(id);
        client.retrieve.mockResolvedValue(result(id));
        expect(await service.callback(id, 'checkout-token')).toMatchObject({
            status: 'FAILED',
            cancellationState: 'PAID_AFTER_CANCEL',
            providerPaymentId: null,
        });
        expect(await service.check(id)).toMatchObject({
            paymentStatus: 'FAILED',
        });
    });

    it('keeps a cancelled checkout cancelled when the late callback is a failure', async () => {
        const initialized = await service.initialize(payment());
        const id = initialized.paymentChannelOperationId;
        client.retrieve.mockRejectedValueOnce(new Error('iyzico rejected'));
        await service.cancel(id);
        client.retrieve.mockResolvedValue(
            result(id, { paymentStatus: 'FAILURE' }),
        );
        expect(
            (await service.callback(id, 'checkout-token')).cancellationState,
        ).toBe('CANCELLED');
    });
});
