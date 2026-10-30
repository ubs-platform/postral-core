import { BadGatewayException, Injectable, Logger } from '@nestjs/common';
import { createHmac, timingSafeEqual } from 'node:crypto';
import Iyzipay from 'iyzipay';
import Big from 'big.js';
import type { mapCheckout } from './iyzico-checkout.mapper';

export class IyzicoRefundRejectedError extends BadGatewayException {
    constructor(readonly providerCode: string) {
        super(`iyzico rejected refund (code ${providerCode})`);
    }
}

export interface IyzicoRefundRequest {
    conversationId: string;
    paymentTransactionId: string;
    price: string;
    currency: string;
}

export function responseObject(value: unknown): Record<string, unknown> {
    if (!value || typeof value !== 'object' || Array.isArray(value)) {
        throw new BadGatewayException('Invalid iyzico response');
    }
    return value as Record<string, unknown>;
}

export function responseString(value: unknown): string {
    if (typeof value !== 'string' || !value) {
        throw new BadGatewayException('Missing string in iyzico response');
    }
    return value;
}

export function responseDecimal(value: unknown): string {
    if (
        (typeof value !== 'string' && typeof value !== 'number') ||
        !/^\d+(\.\d+)?$/.test(String(value))
    ) {
        throw new BadGatewayException('Invalid decimal in iyzico response');
    }
    return new Big(value).toString();
}

export function verifyResponseSignature(
    secret: string,
    params: string[],
    signature: unknown,
): void {
    if (typeof signature !== 'string' || !/^[a-f0-9]{64}$/i.test(signature)) {
        throw new BadGatewayException('Missing or invalid iyzico signature');
    }
    const expected = createHmac('sha256', secret)
        .update(params.join(':'))
        .digest();
    if (!timingSafeEqual(expected, Buffer.from(signature, 'hex'))) {
        throw new BadGatewayException('iyzico signature verification failed');
    }
}

@Injectable()
export class IyzicoClientService {
    private readonly logger = new Logger(IyzicoClientService.name);
    private readonly sdk: Iyzipay;
    private readonly secret: string;
    readonly publicBaseUrl: URL;

    constructor() {
        if (process.env.NODE_ENV === 'production') {
            throw new Error(
                'The iyzico adapter is sandbox-only; production is not enabled',
            );
        }
        const apiKey = process.env.IYZIPAY_API_KEY;
        const secret = process.env.IYZIPAY_SECRET_KEY;
        const publicBase = process.env.IYZICO_PUBLIC_BASE_URL;
        if (!apiKey || !secret || !publicBase) {
            throw new Error(
                'IYZIPAY_API_KEY, IYZIPAY_SECRET_KEY and IYZICO_PUBLIC_BASE_URL are required',
            );
        }
        if (
            process.env.IYZIPAY_URI &&
            process.env.IYZIPAY_URI !== 'https://sandbox-api.iyzipay.com'
        ) {
            throw new Error('Only https://sandbox-api.iyzipay.com is enabled');
        }
        this.publicBaseUrl = new URL(publicBase);
        if (
            !['http:', 'https:'].includes(this.publicBaseUrl.protocol) ||
            this.publicBaseUrl.username ||
            this.publicBaseUrl.password ||
            this.publicBaseUrl.search ||
            this.publicBaseUrl.hash ||
            !this.publicBaseUrl.pathname.endsWith(
                '/service/payment/api/iyzico/',
            )
        ) {
            throw new Error(
                'IYZICO_PUBLIC_BASE_URL must end with /service/payment/api/iyzico/ without credentials, query or fragment',
            );
        }
        this.secret = secret;
        this.sdk = new Iyzipay({
            apiKey,
            secretKey: secret,
            uri: 'https://sandbox-api.iyzipay.com',
        });
    }

    private async call(
        action: (
            callback: (error: Error | null, result: unknown) => void,
        ) => void,
        refundConversationId?: string,
    ): Promise<Record<string, unknown>> {
        try {
            const result = await new Promise<unknown>((resolve, reject) => {
                const timer = setTimeout(
                    () =>
                        reject(
                            new BadGatewayException(
                                'iyzico request timed out; reconcile before retrying financial operations',
                            ),
                        ),
                    20_000,
                );
                try {
                    action((error, body) => {
                        clearTimeout(timer);
                        if (error)
                            reject(
                                new BadGatewayException(
                                    'iyzico transport failed; reconciliation may be required',
                                ),
                            );
                        else resolve(body);
                    });
                } catch (error) {
                    clearTimeout(timer);
                    reject(
                        error instanceof Error
                            ? error
                            : new Error('iyzico SDK call failed'),
                    );
                }
            });
            const body = responseObject(result);
            if (body.status !== 'success') {
                const code =
                    typeof body.errorCode === 'string'
                        ? body.errorCode
                        : 'UNKNOWN';
                if (refundConversationId && body.conversationId === refundConversationId && code !== 'UNKNOWN') {
                    throw new IyzicoRefundRejectedError(code);
                }
                throw new BadGatewayException(
                    `iyzico rejected the request (code ${code}); reconciliation may be required`,
                );
            }
            return body;
        } catch (error) {
            this.logger.error(
                error instanceof Error
                    ? error.message
                    : 'iyzico request failed',
            );
            throw error;
        }
    }

    async initialize(request: ReturnType<typeof mapCheckout>) {
        console.info("iyzico initialize request:", request);
        const result = await this.call((cb) =>
            this.sdk.checkoutFormInitialize.create(request, cb),
        );
        const conversationId = responseString(result.conversationId);
        const token = responseString(result.token);
        verifyResponseSignature(
            this.secret,
            [conversationId, token],
            result.signature,
        );
        if (conversationId !== request.conversationId) {
            throw new BadGatewayException(
                'iyzico initialization correlation mismatch',
            );
        }
        const page = new URL(responseString(result.paymentPageUrl));
        if (
            page.protocol !== 'https:' ||
            page.username ||
            page.password ||
            page.port ||
            !(
                page.hostname === 'iyzipay.com' ||
                page.hostname.endsWith('.iyzipay.com')
            )
        ) {
            throw new BadGatewayException('Unexpected iyzico payment page URL');
        }
        return { token, paymentPageUrl: page.toString() };
    }

    async retrieve(token: string, operationId: string) {
        const result = await this.call((cb) =>
            this.sdk.checkoutForm.retrieve(
                {
                    locale: 'tr',
                    conversationId: operationId,
                    token,
                },
                cb,
            ),
        );
        verifyResponseSignature(
            this.secret,
            [
                responseString(result.paymentStatus),
                responseString(result.paymentId),
                responseString(result.currency),
                responseString(result.basketId),
                responseString(result.conversationId),
                responseDecimal(result.paidPrice),
                responseDecimal(result.price),
                responseString(result.token),
            ],
            result.signature,
        );
        if (result.conversationId !== operationId || result.token !== token) {
            throw new BadGatewayException(
                'iyzico payment correlation mismatch',
            );
        }
        return result;
    }

    async refund(request: IyzicoRefundRequest, providerPaymentId: string): Promise<{ refundHostReference?: string }> {
        const result = await this.call(
            cb => this.sdk.refund.create({ locale: 'tr', ...request }, cb),
            request.conversationId,
        );
        verifyResponseSignature(this.secret, [
            responseString(result.paymentId),
            responseDecimal(result.price),
            responseString(result.currency),
            responseString(result.conversationId),
        ], result.signature);
        if (result.paymentId !== providerPaymentId ||
            result.paymentTransactionId !== request.paymentTransactionId ||
            result.conversationId !== request.conversationId ||
            result.currency !== request.currency ||
            !new Big(responseDecimal(result.price)).eq(request.price)) {
            throw new BadGatewayException('iyzico refund correlation or amount mismatch');
        }
        return {
            ...(typeof result.refundHostReference === 'string' ? { refundHostReference: result.refundHostReference } : {}),
        };
    }

    /** Kişisel veri içeren gövdeyi saklamadan değişim tespiti için anahtarlı özet. */
    fingerprint(value: object): string {
        const canonical = JSON.stringify(value, Object.keys(value).sort());
        return createHmac('sha256', this.secret).update(canonical).digest('hex');
    }

    async createSubMerchant(request: { subMerchantExternalId: string }): Promise<string> {
        const conversationId = String(request.subMerchantExternalId);
        const result = await this.call((cb) =>
            this.sdk.subMerchant.create({ locale: 'tr', conversationId, ...request }, cb),
        );
        this.assertSubMerchantCorrelation(result, conversationId);
        return responseString(result.subMerchantKey);
    }

    async updateSubMerchant(
        subMerchantKey: string,
        request: object,
    ): Promise<void> {
        const result = await this.call((cb) =>
            this.sdk.subMerchant.update(
                { locale: 'tr', conversationId: subMerchantKey, subMerchantKey, ...request },
                cb,
            ),
        );
        this.assertSubMerchantCorrelation(result, subMerchantKey);
    }

    async retrieveSubMerchantKey(subMerchantExternalId: string): Promise<string> {
        const result = await this.call((cb) =>
            this.sdk.subMerchant.retrieve(
                { locale: 'tr', conversationId: subMerchantExternalId, subMerchantExternalId },
                cb,
            ),
        );
        return responseString(result.subMerchantKey);
    }

    private assertSubMerchantCorrelation(
        result: Record<string, unknown>,
        conversationId: string,
    ) {
        if (
            result.conversationId !== undefined &&
            result.conversationId !== conversationId
        ) {
            throw new BadGatewayException('iyzico sub-merchant correlation mismatch');
        }
    }
}
