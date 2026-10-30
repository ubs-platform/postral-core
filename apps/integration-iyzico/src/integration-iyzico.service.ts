import {
    BadGatewayException,
    BadRequestException,
    ConflictException,
    Inject,
    Injectable,
    Logger,
    NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { ClientProxy } from '@nestjs/microservices';
import type {
    PaymentChannelStatusDTO,
    PaymentFullWithCaptureInfoDTO,
    PrepareChannelRefundDTO,
} from '@tk-postral/payment-common';
import { IsNull, QueryFailedError, Repository } from 'typeorm';
import { lastValueFrom, timeout } from 'rxjs';
import { randomUUID } from 'node:crypto';
import Big from 'big.js';
import { IyzicoOperation } from './iyzico-operation.entity';
import {
    IyzicoClientService,
    responseDecimal,
    responseObject,
    responseString,
} from './iyzico-client.service';
import { mapCheckout } from './iyzico-checkout.mapper';
import { IyzicoRefundService } from './iyzico-refund.service';
import { IyzicoSubMerchantService } from './iyzico-sub-merchant.service';

@Injectable()
export class IntegrationIyzicoService {
    private readonly logger = new Logger(IntegrationIyzicoService.name);

    constructor(
        @InjectRepository(IyzicoOperation)
        private readonly operations: Repository<IyzicoOperation>,
        private readonly client: IyzicoClientService,
        @Inject('MICROSERVICE_CLIENT') private readonly messages: ClientProxy,
        private readonly refunds: IyzicoRefundService,
        private readonly subMerchants: IyzicoSubMerchantService,
    ) {}

    prepareRefund(request: PrepareChannelRefundDTO) {
        return this.refunds.prepare(request);
    }

    async initialize(
        payment: PaymentFullWithCaptureInfoDTO,
    ): Promise<PaymentChannelStatusDTO> {
        if (payment.type === 'REFUND') return this.refunds.initialize(payment);
        const id = randomUUID();
        const subMerchantKeys = await this.ensureSubMerchants(payment);
        const request = mapCheckout(
            payment,
            id,
            new URL(`callback/${id}`, this.client.publicBaseUrl).toString(),
            subMerchantKeys,
        );
        const reservation = this.operations.create({
            id,
            paymentId: payment.id,
            amount: request.paidPrice,
            currency: request.currency,
            status: 'WAITING',
            initializationState: 'INITIALIZING',
            basketLines: request.basketItems.map((item) => ({
                paymentItemId: item.id,
                price: item.price,
            })),
        });
        try {
            await this.operations.insert(reservation);
        } catch (error) {
            if (
                !(error instanceof QueryFailedError) ||
                responseObject(error.driverError).code !== 'ER_DUP_ENTRY'
            ) {
                throw error;
            }
            const existing = await this.operations.findOneByOrFail({
                paymentId: payment.id,
            });
            if (
                existing.amount !== reservation.amount ||
                existing.currency !== reservation.currency ||
                JSON.stringify(existing.basketLines) !==
                    JSON.stringify(reservation.basketLines)
            ) {
                throw new ConflictException(
                    'iyzico payment was already reserved with different capture details',
                );
            }
            if (existing.initializationState !== 'INITIALIZED') {
                throw new ConflictException(
                    'iyzico initialization needs reconciliation; it will not be sent twice',
                );
            }
            return this.toStatus(existing);
        }
        try {
            const result = await this.client.initialize(request);
            await this.operations.update(id, {
                ...result,
                initializationState: 'INITIALIZED',
            });
            return this.toStatus(await this.find(id));
        } catch (error) {
            await this.operations.update(id, {
                initializationState: 'RECONCILIATION_REQUIRED',
            });
            this.logger.error(
                `iyzico initialization ${id} requires reconciliation; no automatic reinitialization`,
            );
            throw error;
        }
    }

    /** `IYZICO_ENABLE_SUBMERCHANTS=true` ise satıcı satırları alt üye işyerine yönlenir. */
    private async ensureSubMerchants(
        payment: PaymentFullWithCaptureInfoDTO,
    ): Promise<Map<string, string> | undefined> {
        if (process.env.IYZICO_ENABLE_SUBMERCHANTS !== 'true') return undefined;
        const sellerAccountIds = new Set(
            (payment.items ?? []).flatMap((item) =>
                item.sellerAccountId ? [item.sellerAccountId] : [],
            ),
        );
        const keys = new Map<string, string>();
        for (const accountId of sellerAccountIds) {
            keys.set(accountId, await this.subMerchants.ensure(accountId));
        }
        return keys;
    }

    async find(id: string): Promise<IyzicoOperation> {
        const operation = await this.operations.findOneBy({ id });
        if (!operation)
            throw new NotFoundException('iyzico operation not found');
        return operation;
    }

    toStatus(operation: IyzicoOperation): PaymentChannelStatusDTO {
        return {
            paymentChannelId: 'iyzico',
            paymentChannelOperationId: operation.id,
            // Path only: the browser resolves it against the origin it is on.
            redirectUrl: new URL(
                `operation/${operation.id}`,
                this.client.publicBaseUrl,
            ).pathname,
            paymentStatus: operation.status,
            feeCutInstantly: true,
            ...(operation.providerFee !== null &&
            operation.providerFee !== undefined
                ? { providerFee: Number(operation.providerFee) }
                : {}),
        };
    }

    async launch(id: string, redirectUrl: unknown): Promise<string> {
        const operation = await this.find(id);
        if (typeof redirectUrl !== 'string' || !redirectUrl) {
            throw new BadRequestException(
                'A same-origin redirectUrl is required',
            );
        }
        let returnUrl: URL;
        try {
            returnUrl = new URL(redirectUrl, this.client.publicBaseUrl.origin);
        } catch {
            throw new BadRequestException('Invalid redirectUrl');
        }
        if (
            returnUrl.origin !== this.client.publicBaseUrl.origin ||
            returnUrl.username ||
            returnUrl.password
        ) {
            throw new BadRequestException(
                'redirectUrl must use the configured application origin',
            );
        }
        if (
            operation.initializationState !== 'INITIALIZED' ||
            !operation.paymentPageUrl
        ) {
            throw new ConflictException(
                'iyzico checkout is not initialized; reconciliation is required',
            );
        }
        const normalized = returnUrl.toString();
        await this.operations.update(
            { id, returnUrl: IsNull() },
            { returnUrl: normalized },
        );
        const saved = await this.find(id);
        if (saved.returnUrl !== normalized) {
            throw new ConflictException(
                'iyzico operation is already bound to another return URL',
            );
        }
        if (saved.status !== 'WAITING') return this.returnUrl(saved)!;
        return operation.paymentPageUrl;
    }

    returnUrl(operation: IyzicoOperation): string | null {
        if (!operation.returnUrl) return null;
        const target = new URL(operation.returnUrl);
        target.searchParams.set('operationId', operation.id);
        target.searchParams.set('status', operation.status);
        return target.toString();
    }

    async callback(id: string, token: unknown): Promise<IyzicoOperation> {
        const operation = await this.find(id);
        if (
            typeof token !== 'string' ||
            !operation.token ||
            token !== operation.token
        ) {
            throw new BadRequestException('Invalid iyzico callback token');
        }
        await this.operations.update(id, { callbackReceived: true });
        if (operation.cancellationState === 'CANCELLED') {
            await this.flagPaymentAfterCancellation(operation);
            return this.find(id);
        }
        await this.check(id);
        return this.find(id);
    }

    private async flagPaymentAfterCancellation(
        operation: IyzicoOperation,
    ): Promise<void> {
        const result = await this.client.retrieve(
            operation.token!,
            operation.id,
        );
        if (result.paymentStatus !== 'SUCCESS') return;
        await this.operations.update(
            { id: operation.id, cancellationState: 'CANCELLED' },
            { cancellationState: 'PAID_AFTER_CANCEL' },
        );
        this.logger.error(
            `iyzico operation ${operation.id} was paid after cancellation; manual reconciliation/refund is required`,
        );
    }

    async check(id: string): Promise<PaymentChannelStatusDTO> {
        let operation = await this.operations.findOneBy({ id });
        if (!operation) return this.refunds.check(id);
        if (
            operation.status === 'WAITING' &&
            operation.callbackReceived &&
            operation.token
        ) {
            const result = await this.client.retrieve(
                operation.token,
                operation.id,
            );
            if (
                result.basketId !== operation.paymentId ||
                result.currency !== operation.currency ||
                !new Big(responseDecimal(result.price)).eq(operation.amount) ||
                !new Big(responseDecimal(result.paidPrice)).eq(operation.amount)
            ) {
                this.logger.error(
                    `iyzico operation ${id} has mismatched payment details`,
                );
                throw new BadGatewayException(
                    'iyzico payment amount, currency or basket mismatch',
                );
            }
            if (
                !['SUCCESS', 'FAILURE'].includes(
                    responseString(result.paymentStatus),
                ) ||
                typeof result.fraudStatus !== 'number' ||
                ![-1, 0, 1].includes(result.fraudStatus)
            ) {
                throw new BadGatewayException(
                    'Unexpected iyzico payment or fraud status',
                );
            }
            const status =
                result.paymentStatus === 'FAILURE' || result.fraudStatus === -1
                    ? 'FAILED'
                    : result.fraudStatus === 1
                      ? 'COMPLETED'
                      : 'WAITING';
            let itemTransactions = operation.itemTransactions;
            let providerFee = operation.providerFee;
            if (status === 'COMPLETED') {
                if (result.installment !== 1) {
                    throw new BadGatewayException(
                        'Unexpected iyzico installment count',
                    );
                }
                if (!Array.isArray(result.itemTransactions)) {
                    throw new BadGatewayException(
                        'Missing iyzico item transactions',
                    );
                }
                const transactions = result.itemTransactions.map(
                    (value: unknown) => {
                        const item = responseObject(value);
                        if (
                            item.transactionStatus !== 1 &&
                            item.transactionStatus !== 2
                        ) {
                            throw new BadGatewayException(
                                'iyzico item transaction is not approved',
                            );
                        }
                        return {
                            paymentItemId: responseString(item.itemId),
                            paymentTransactionId: responseString(
                                item.paymentTransactionId,
                            ),
                            price: responseDecimal(item.price),
                            paidPrice: responseDecimal(item.paidPrice),
                        };
                    },
                );
                if (
                    transactions.length !== operation.basketLines.length ||
                    new Set(transactions.map((item) => item.paymentItemId))
                        .size !== transactions.length ||
                    new Set(
                        transactions.map((item) => item.paymentTransactionId),
                    ).size !== transactions.length ||
                    operation.basketLines.some(
                        (line) =>
                            !transactions.some(
                                (item) =>
                                    item.paymentItemId === line.paymentItemId &&
                                    new Big(item.price).eq(line.price),
                            ),
                    ) ||
                    !transactions
                        .reduce(
                            (sum, item) => sum.plus(item.paidPrice),
                            new Big(0),
                        )
                        .eq(operation.amount)
                ) {
                    throw new BadGatewayException(
                        'iyzico basket transaction mapping mismatch',
                    );
                }
                itemTransactions = transactions;
                providerFee = new Big(
                    responseDecimal(result.iyziCommissionRateAmount),
                )
                    .plus(responseDecimal(result.iyziCommissionFee))
                    .round(4)
                    .toFixed(4);
            }
            await this.operations.update(
                { id, status: 'WAITING' },
                {
                    status,
                    providerPaymentId: responseString(result.paymentId),
                    providerFee,
                    itemTransactions,
                },
            );
            operation = await this.find(id);
        }
        return this.toStatus(operation);
    }

    async notify(id: string): Promise<void> {
        // Persist before publishing. Repeated callbacks can safely retry a lost notification.
        await lastValueFrom(
            this.messages
                .emit('postral/payment-operation-status-updated', id)
                .pipe(timeout(5_000)),
        );
    }

    async fire(id: string): Promise<PaymentChannelStatusDTO> {
        const status = await this.check(id);
        if (status.paymentStatus !== 'COMPLETED') {
            throw new ConflictException(
                'iyzico checkout is not captured; preauthorization is not supported',
            );
        }
        return status;
    }

    /**
     * Cancels an unpaid checkout locally. iyzico has no documented way to
     * invalidate an open Checkout Form token, so a payment completed after this
     * point is flagged as `PAID_AFTER_CANCEL` on callback instead.
     */
    async cancel(id: string): Promise<PaymentChannelStatusDTO> {
        const operation = await this.find(id);
        if (operation.status === 'FAILED') return this.toStatus(operation);
        if (operation.status !== 'WAITING') {
            throw new ConflictException(
                'iyzico payment is already captured; use a refund instead of cancellation',
            );
        }
        if (operation.token && (await this.providerReportsPaid(operation))) {
            throw new ConflictException(
                'iyzico reports this checkout as paid; it cannot be cancelled',
            );
        }
        await this.operations.update(
            { id, status: 'WAITING' },
            { status: 'FAILED', cancellationState: 'CANCELLED' },
        );
        const cancelled = await this.find(id);
        if (cancelled.cancellationState !== 'CANCELLED') {
            throw new ConflictException(
                'iyzico operation changed during cancellation; check its status',
            );
        }
        return this.toStatus(cancelled);
    }

    private async providerReportsPaid(
        operation: IyzicoOperation,
    ): Promise<boolean> {
        try {
            const result = await this.client.retrieve(
                operation.token!,
                operation.id,
            );
            return result.paymentStatus === 'SUCCESS';
        } catch {
            // iyzico does not document the response for an unpaid form; a later
            // successful callback is still caught by flagPaymentAfterCancellation.
            this.logger.warn(
                `iyzico operation ${operation.id} has no retrievable payment; cancelling locally`,
            );
            return false;
        }
    }
}
