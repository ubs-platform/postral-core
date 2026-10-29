import { BadRequestException, ConflictException, Injectable, Logger, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import type { PaymentChannelStatusDTO, PaymentFullWithCaptureInfoDTO, RefundChannelLine, PrepareChannelRefundDTO, PreparedChannelRefund, RefundChannelPlan } from '@tk-postral/payment-common';
import { Repository } from 'typeorm';
import Big from 'big.js';
import { IyzicoOperation } from './iyzico-operation.entity';
import { IyzicoRefund, IyzicoRefundLine } from './iyzico-refund.entity';
import { IyzicoClientService, IyzicoRefundRejectedError } from './iyzico-client.service';
import { refundProviderAmount, refundRoundingMode, RefundRoundingMode } from './refund-rounding.util';

@Injectable()
export class IyzicoRefundService {
    private readonly logger = new Logger(IyzicoRefundService.name);
    private readonly roundingMode = refundRoundingMode(process.env.IYZICO_REFUND_ROUNDING_MODE);

    constructor(
        @InjectRepository(IyzicoRefund) private readonly refunds: Repository<IyzicoRefund>,
        private readonly client: IyzicoClientService,
    ) {}

    async prepare(request: PrepareChannelRefundDTO): Promise<PreparedChannelRefund> {
        const source = request.captures?.[0];
        if (request.captures?.length !== 1 || !source ||
            source.paymentChannelId !== 'iyzico' || source.amount !== request.purchaseAmount ||
            !request.items?.length) {
            throw new BadRequestException('iyzico refunds require one full-amount completed capture');
        }
        const operation = await this.refunds.manager.findOne(IyzicoOperation, {
            where: { id: source.originalChannelOperationId },
        });
        if (!operation || operation.paymentId !== request.purchasePaymentId ||
            operation.currency !== request.currency || operation.status !== 'COMPLETED' ||
            !new Big(operation.amount).eq(request.purchaseAmount) || !operation.itemTransactions?.length) {
            throw new BadRequestException('A matching completed iyzico capture is required');
        }
        const lines = request.items.map(item => {
            if (!item || typeof item.nominalAmount !== 'string' || !/^\d+\.\d{4}$/.test(item.nominalAmount) ||
                !operation.itemTransactions!.some(line => line.paymentItemId === item.originalPaymentItemId &&
                    new Big(item.nominalAmount).lte(line.price))) {
                throw new BadRequestException('Refund original line or historical amount is invalid');
            }
            return { ...item, providerAmount: refundProviderAmount(item.nominalAmount, this.roundingMode) };
        }).sort((a, b) => a.originalPaymentItemId.localeCompare(b.originalPaymentItemId));
        if (new Set(lines.map(line => line.originalPaymentItemId)).size !== lines.length) {
            throw new BadRequestException('Refund original line IDs must be unique');
        }
        return { plans: [{
            originalOperationId: source.originalOperationId,
            originalChannelOperationId: source.originalChannelOperationId,
            channelData: { roundingMode: this.roundingMode },
            lines,
        }] };
    }

    private planRoundingMode(plan: RefundChannelPlan): RefundRoundingMode {
        // Read pre-refactor persisted plans without reinterpreting their saved policy.
        const value = plan.channelData?.roundingMode ?? ('roundingMode' in plan ? plan.roundingMode : undefined);
        if (typeof value !== 'string') throw new BadRequestException('iyzico refund rounding policy is missing');
        return refundRoundingMode(value);
    }

    private validate(payment: PaymentFullWithCaptureInfoDTO): RefundChannelLine[] {
        const plan = payment.refundPlan;
        if (payment.type !== 'REFUND' || payment.openPayment || !payment.refundOperationId ||
            !payment.originalPaymentChannelOperationId || !payment.id || !plan ||
            plan.originalChannelOperationId !== payment.originalPaymentChannelOperationId ||
            payment.captureInfo?.paymentChannelId !== 'iyzico' ||
            payment.captureInfo.currency !== payment.currency ||
            !Number.isFinite(payment.captureInfo.paidAmount) ||
            payment.captureInfo.paidAmount !== payment.totalAmount ||
            !Array.isArray(plan.lines) || !plan.lines.length) {
            throw new BadRequestException('Invalid iyzico refund plan or capture');
        }
        this.planRoundingMode(plan);
        if (plan.lines.some(line => !line || typeof line.originalPaymentItemId !== 'string' ||
                !line.originalPaymentItemId || typeof line.nominalAmount !== 'string' ||
                typeof line.providerAmount !== 'string' ||
                !/^\d+\.\d{4}$/.test(line.nominalAmount) || !/^\d+\.\d{2}$/.test(line.providerAmount) ||
                new Big(line.nominalAmount).lte(0) || new Big(line.providerAmount).lte(0))) {
            throw new BadRequestException('Invalid iyzico refund line amounts or identities');
        }
        let lines = [...plan.lines];
        if (payment.items?.some(item => item.originalPaymentItemId != null)) {
            if (payment.items.length !== lines.length ||
                new Set(payment.items.map(item => item.originalPaymentItemId)).size !== payment.items.length) {
                throw new BadRequestException('Refund payment item origins or amounts do not match the saved plan');
            }
            lines = payment.items.map(item => {
                const line = plan.lines.find(candidate => candidate.originalPaymentItemId === item.originalPaymentItemId);
                if (!line || typeof item.originalPaymentItemId !== 'string' || !item.originalPaymentItemId ||
                    !Number.isFinite(item.totalAmount) || !new Big(line.nominalAmount).eq(item.totalAmount)) {
                    throw new BadRequestException('Refund payment item origins or amounts do not match the saved plan');
                }
                return { ...line, originalPaymentItemId: item.originalPaymentItemId };
            });
        }
        // Refund payments created before originalPaymentItemId rely on their persisted plan.
        lines.sort((a, b) => a.originalPaymentItemId.localeCompare(b.originalPaymentItemId));
        if (new Set(lines.map(line => line.originalPaymentItemId)).size !== lines.length ||
            !lines.reduce((sum, line) => sum.plus(line.nominalAmount), new Big(0)).eq(payment.captureInfo.paidAmount!)) {
            throw new BadRequestException('Invalid iyzico refund line amounts or identities');
        }
        return lines;
    }

    async initialize(payment: PaymentFullWithCaptureInfoDTO): Promise<PaymentChannelStatusDTO> {
        const lines = this.validate(payment);
        const reservation = await this.refunds.manager.transaction(async manager => {
            const source = await manager.findOne(IyzicoOperation, {
                where: { id: payment.originalPaymentChannelOperationId },
                lock: { mode: 'pessimistic_write' },
            });
            if (!source || source.status !== 'COMPLETED' || !source.providerPaymentId ||
                !source.itemTransactions?.length || source.currency !== payment.currency) {
                throw new BadRequestException('A completed iyzico capture with verified transactions is required');
            }
            const existing = await manager.findOne(IyzicoRefund, { where: { id: payment.refundOperationId } });
            if (existing) {
                if (existing.paymentId !== payment.id || existing.originalOperationId !== source.id ||
                    existing.currency !== payment.currency || existing.roundingMode !== this.planRoundingMode(payment.refundPlan!) ||
                    JSON.stringify(existing.lines.map(({ originalPaymentItemId, nominalAmount, providerAmount }) =>
                        ({ originalPaymentItemId, nominalAmount, providerAmount }))) !== JSON.stringify(lines)) {
                    throw new ConflictException('iyzico refund ID was reserved with different details');
                }
                return { refund: existing, providerPaymentId: source.providerPaymentId };
            }
            const previous = await manager.find(IyzicoRefund, { where: { originalOperationId: source.id } });
            const reservedLines: IyzicoRefundLine[] = lines.map((line, index) => {
                const transaction = source.itemTransactions!.find(item => item.paymentItemId === line.originalPaymentItemId);
                if (!transaction) throw new BadRequestException('Original payment item is missing from iyzico capture');
                // All submitted/ambiguous reservations keep their capacity until explicit reconciliation.
                const prior = previous.flatMap(refund => refund.lines)
                    .filter(item => item.originalPaymentItemId === line.originalPaymentItemId);
                const reservedProvider = prior.reduce((sum, item) => sum.plus(item.providerAmount), new Big(0));
                const reservedNominal = prior.reduce((sum, item) => sum.plus(item.nominalAmount), new Big(0));
                if (reservedProvider.plus(line.providerAmount).gt(transaction.paidPrice) ||
                    reservedNominal.plus(line.nominalAmount).gt(transaction.price)) {
                    throw new BadRequestException('iyzico refund exceeds remaining original transaction balance');
                }
                return { ...line, paymentTransactionId: transaction.paymentTransactionId,
                    conversationId: `${payment.refundOperationId}:${index}`, state: 'RESERVED' };
            });
            const refund = Object.assign(new IyzicoRefund(), {
                id: payment.refundOperationId, paymentId: payment.id, originalOperationId: source.id,
                currency: source.currency, roundingMode: this.planRoundingMode(payment.refundPlan!),
                state: 'RESERVED', lines: reservedLines,
            });
            await manager.insert(IyzicoRefund, refund);
            return { refund, providerPaymentId: source.providerPaymentId };
        });
        const refund = reservation.refund;
        const claim = await this.refunds.update({ id: refund.id, state: 'RESERVED' }, { state: 'SUBMITTING' });
        if (!claim.affected) return this.check(refund.id);
        for (const line of refund.lines) {
            line.state = 'SUBMITTING';
            await this.refunds.update(refund.id, { lines: refund.lines });
            try {
                const result = await this.client.refund({
                    paymentTransactionId: line.paymentTransactionId,
                    conversationId: line.conversationId, price: line.providerAmount, currency: refund.currency,
                }, reservation.providerPaymentId);
                line.state = 'SUCCEEDED';
                Object.assign(line, result);
                await this.refunds.update(refund.id, { lines: refund.lines });
            } catch (error) {
                line.state = error instanceof IyzicoRefundRejectedError ? 'REJECTED' : 'RECONCILIATION_REQUIRED';
                if (error instanceof IyzicoRefundRejectedError) line.errorCode = error.providerCode;
                await this.refunds.update(refund.id, { state: 'RECONCILIATION_REQUIRED', lines: refund.lines });
                this.logger.error(`iyzico refund ${refund.id}/${line.originalPaymentItemId} stopped (${line.state}); no automatic resubmission`);
                return this.check(refund.id);
            }
        }
        await this.refunds.update(refund.id, { state: 'FINISHED' });
        return this.check(refund.id);
    }

    async check(id: string): Promise<PaymentChannelStatusDTO> {
        const refund = await this.refunds.findOneBy({ id });
        if (!refund) throw new NotFoundException('iyzico refund not found');
        const succeeded = refund.lines.filter(line => line.state === 'SUCCEEDED');
        const failed = succeeded.length === 0 && refund.lines.some(line => line.state === 'REJECTED');
        return {
            paymentChannelId: 'iyzico', paymentChannelOperationId: refund.id, redirectUrl: '',
            paymentStatus: succeeded.length === refund.lines.length ? 'COMPLETED' : failed ? 'FAILED' : 'WAITING',
            ...(refund.state === 'RECONCILIATION_REQUIRED' ? { paymentErrorStatus: 'UNKNOWN' } : {}),
            refundSettlements: succeeded.map(line => ({
                originalPaymentItemId: line.originalPaymentItemId, providerAmount: line.providerAmount,
            })),
        };
    }
}
