import { BadRequestException, ConflictException, Injectable, Logger } from '@nestjs/common';
import { Account, AccountPaymentTransaction, Payment, PaymentChannelOperation } from '@tk-postral/postral-entities';
import { InjectRepository } from '@nestjs/typeorm';
import { In, Not, Repository } from 'typeorm';
import Big from 'big.js';
import { PaymentItemMapper } from '../mapper/payment-item.mapper';
import { PaymentTaxMapper } from '../mapper/payment-tax.mapper';
import { PaymentMapper } from '../mapper/payment.mapper';
import { AccountService } from './account.service';
import { OrderCalculationService } from './order-calculation.service';
import { EventSenderService } from './event-management.service';
import {
    PaymentChannelStatusDTO,
    PaymentCaptureInfoDTO,
    PaymentDTO,
    PaymentFullDTO,
    RefundRequestDTO,
    RefundChannelPlan,
} from '@tk-postral/payment-common';
import { TypeAssertionUtil, AmountCalculationUtil } from '@tk-postral/common-utils';
import { PaymentFullWithCaptureInfoDTO } from '@tk-postral/payment-common';
import { AdminSettingsService } from './admin-settings.service';
import { exec } from 'child_process';
import { randomUUID } from 'node:crypto';
import {
    appendReturnParams,
    operationReturnPath,
    validateReturnUrl,
    withChannelReturnUrl,
} from '../util/payment-return-url.util';

@Injectable()
export class PaymentOperationManagementService {
    private readonly logger = new Logger(PaymentOperationManagementService.name);

    /**
     *
     */
    constructor(
        private eventSenderService: EventSenderService,
        private calcService: OrderCalculationService,
        private adminSettingsService: AdminSettingsService,
        @InjectRepository(PaymentChannelOperation)
        private readonly paymentChannelOperationRepo: Repository<PaymentChannelOperation>,
    ) { }
    // This service will handle payment operation management logic

    async savePaymentChannelRecord(
        paymentOperationRecord: PaymentChannelOperation,
        result: PaymentChannelStatusDTO,
        paymentId: string,
    ) {
        if (paymentOperationRecord.operationType === 'REFUND' && paymentOperationRecord.refundPlan) {
            return this.saveRefundSettlementRecord(paymentOperationRecord, result, paymentId);
        }
        const stgs = await this.adminSettingsService.getAdminSettings();

        paymentOperationRecord.operationId = result.paymentChannelOperationId!;
        paymentOperationRecord.paymentId = paymentId;
        paymentOperationRecord.paymentChannelId = result.paymentChannelId!;
        paymentOperationRecord.status = result.paymentStatus;
        // exec(`kdialog --msgbox "MQ servisinden gelen ödeme provider ücreti: ${result.providerFee}"`);
        if (result.providerFee != null) {
            paymentOperationRecord.providerFee = result.providerFee;
        }
        if (result.feeCutInstantly != null) {
            paymentOperationRecord.feeCutInstantly = result.feeCutInstantly;
        }
        // paymentOperationRecord.feeCutInstantly = result.feeCutInstantly ?? true;
        paymentOperationRecord.providerFeeDebitFrom = stgs.sellerPaysPaymentServiceFee ? 'SELLER' : 'PLATFORM';
        await this.paymentChannelOperationRepo.save(paymentOperationRecord);
        return result;
    }

    private async saveRefundSettlementRecord(record: PaymentChannelOperation, result: PaymentChannelStatusDTO, paymentId: string) {
        const settings = await this.adminSettingsService.getAdminSettings();
        await this.paymentChannelOperationRepo.manager.transaction(async manager => {
            const operation = await manager.findOneOrFail(PaymentChannelOperation, {
                where: { id: record.id }, lock: { mode: 'pessimistic_write' },
            });
            const plan = operation.refundPlan;
            const settlements = result.refundSettlements;
            if (!plan || !Array.isArray(settlements) ||
                settlements.some(line => !line || typeof line.originalPaymentItemId !== 'string' || typeof line.providerAmount !== 'string') ||
                operation.operationType !== 'REFUND' || result.paymentChannelId !== operation.paymentChannelId ||
                !result.paymentChannelOperationId ||
                (operation.operationId && result.paymentChannelOperationId !== operation.operationId) || operation.paymentId !== paymentId ||
                !['WAITING', 'READY', 'COMPLETED', 'FAILED'].includes(result.paymentStatus) ||
                new Set(settlements.map(line => line.originalPaymentItemId)).size !== settlements.length ||
                !plan.lines.reduce((sum, line) => sum.plus(line.nominalAmount), new Big(0)).eq(operation.amount) ||
                (result.paymentStatus === 'COMPLETED' && settlements.length !== plan.lines.length) ||
                (result.paymentStatus === 'FAILED' && settlements.length > 0)) {
                throw new BadRequestException('Invalid channel refund settlement; reconciliation is required');
            }
            const settled = new Set(operation.settledRefundItemIds ?? []);
            if (operation.status === 'COMPLETED' && result.paymentStatus !== 'COMPLETED') {
                throw new ConflictException('Completed channel refund cannot regress');
            }
            if ([...settled].some(id => !settlements.some(line => line.originalPaymentItemId === id))) {
                throw new ConflictException('Channel refund settlement cannot lose completed lines');
            }
            for (const settlement of settlements) {
                const line = plan.lines.find(candidate => candidate.originalPaymentItemId === settlement.originalPaymentItemId);
                if (!line || settlement.providerAmount !== line.providerAmount) {
                    throw new BadRequestException('Channel refund settlement amount or line mismatch');
                }
                if (settled.has(line.originalPaymentItemId)) continue;
                const difference = new Big(line.providerAmount).minus(line.nominalAmount);
                if (!difference.eq(0)) {
                    if (!plan.roundingAccountId) throw new BadRequestException('Refund rounding account is missing');
                    const payment = await manager.findOneOrFail(Payment, { where: { id: paymentId } });
                    if (!payment.customerAccountId || payment.customerAccountId === plan.roundingAccountId) {
                        throw new BadRequestException('Invalid refund rounding counterparties');
                    }
                    const accounts = await manager.findBy(Account, { id: In([payment.customerAccountId, plan.roundingAccountId]) });
                    const correlationId = randomUUID();
                    const entries = [payment.customerAccountId, plan.roundingAccountId].map((accountId, index) => {
                        const account = accounts.find(candidate => candidate.id === accountId);
                        if (!account) throw new BadRequestException('Refund rounding account not found');
                        return Object.assign(new AccountPaymentTransaction(), {
                            corelationId: correlationId, accountId, accountName: account.name,
                            paymentId, roundingOperationId: operation.id,
                            type: (difference.gt(0) === (index === 0)) ? 'CREDIT' : 'DEBIT',
                            status: 'COMPLETED', amount: Number(difference.abs()), taxAmount: 0,
                            description: `Refund rounding adjustment for ${operation.id}/${line.originalPaymentItemId}`,
                        });
                    });
                    await manager.save(AccountPaymentTransaction, entries);
                }
                settled.add(line.originalPaymentItemId);
            }
            operation.operationId = result.paymentChannelOperationId;
            operation.status = result.paymentStatus;
            if (result.providerFee != null) operation.providerFee = result.providerFee;
            if (result.feeCutInstantly != null) operation.feeCutInstantly = result.feeCutInstantly;
            operation.providerFeeDebitFrom = settings.sellerPaysPaymentServiceFee ? 'SELLER' : 'PLATFORM';
            operation.settledRefundItemIds = [...settled];
            await manager.save(PaymentChannelOperation, operation);
            Object.assign(record, operation);
        });
        return result;
    }

    async prepareRefundChannelPlan(request: RefundRequestDTO, purchase: PaymentFullDTO): Promise<RefundChannelPlan[]> {
        const operations = await this.paymentChannelOperationRepo.find({
            where: { paymentId: purchase.id, status: 'COMPLETED', operationType: 'PURCHASE' },
            order: { id: 'ASC' },
        });
        if (!operations.length || operations.some(operation => !operation.operationId || operation.currency !== purchase.currency) ||
            purchase.paymentStatus !== 'COMPLETED' || purchase.type !== 'PURCHASE') {
            throw new BadRequestException('Completed purchase channel operations are required for refund preparation');
        }
        const lines = request.items.map(item => {
            const original = purchase.items.find(line => line.id === item.paymentItemId);
            if (!original || item.refundAmount == null || !Number.isFinite(item.refundAmount) ||
                item.refundAmount <= 0 || item.refundAmount > original.totalAmount ||
                !new Big(item.refundAmount).eq(new Big(item.refundAmount).round(4))) {
                throw new BadRequestException('Refund original line or historical amount is invalid');
            }
            return {
                originalPaymentItemId: item.paymentItemId,
                nominalAmount: new Big(item.refundAmount).toFixed(4),
            };
        }).sort((a, b) => a.originalPaymentItemId.localeCompare(b.originalPaymentItemId));
        if (!lines.length || new Set(lines.map(line => line.originalPaymentItemId)).size !== lines.length) {
            throw new BadRequestException('Refund original line IDs must be unique and nonempty');
        }
        const plans: RefundChannelPlan[] = [];
        for (const channelId of new Set(operations.map(operation => operation.paymentChannelId))) {
            const prepared = await this.eventSenderService.prepareChannelRefund(channelId, {
                purchasePaymentId: purchase.id, purchaseAmount: purchase.totalAmount, currency: purchase.currency,
                captures: operations.map(operation => ({
                    originalOperationId: operation.id, originalChannelOperationId: operation.operationId,
                    paymentChannelId: operation.paymentChannelId, amount: operation.amount,
                })),
                items: lines,
            });
            if (!prepared || !Array.isArray(prepared.plans)) {
                throw new BadRequestException('Channel returned an invalid refund preparation');
            }
            for (const plan of prepared.plans) {
                const source = operations.find(operation => operation.id === plan?.originalOperationId);
                if (!source || source.paymentChannelId !== channelId ||
                    plan.originalChannelOperationId !== source.operationId ||
                    plans.some(existing => existing.originalOperationId === plan.originalOperationId) ||
                    (plan.channelData !== undefined && (!plan.channelData || typeof plan.channelData !== 'object' ||
                        Array.isArray(plan.channelData) || Object.values(plan.channelData).some(value => typeof value !== 'string'))) ||
                    !Array.isArray(plan.lines) || !plan.lines.length ||
                    new Set(plan.lines.map(line => line?.originalPaymentItemId)).size !== plan.lines.length ||
                    plan.lines.some(line => !line || typeof line.nominalAmount !== 'string' ||
                        typeof line.providerAmount !== 'string' ||
                        !/^\d+(\.\d{1,4})?$/.test(line.nominalAmount) || !/^\d+(\.\d{1,4})?$/.test(line.providerAmount) ||
                        new Big(line.nominalAmount).lte(0) || new Big(line.providerAmount).lte(0) ||
                        !lines.some(original => original.originalPaymentItemId === line.originalPaymentItemId &&
                            new Big(original.nominalAmount).gte(line.nominalAmount)))) {
                    throw new BadRequestException('Channel returned invalid refund source or line amounts');
                }
                // Accounting ownership is core-owned; the channel cannot select the ledger counterparty.
                plans.push({ originalOperationId: source.id, originalChannelOperationId: source.operationId,
                    channelData: plan.channelData, lines: plan.lines.map(line => ({
                        originalPaymentItemId: line.originalPaymentItemId,
                        nominalAmount: line.nominalAmount, providerAmount: line.providerAmount,
                    })) });
            }
        }
        for (const line of lines) {
            if (plans.flatMap(plan => plan.lines).filter(candidate => candidate.originalPaymentItemId === line.originalPaymentItemId)
                .reduce((sum, candidate) => sum.plus(candidate.nominalAmount), new Big(0)).gt(line.nominalAmount)) {
                throw new BadRequestException('Channel plans exceed the requested refund line amount');
            }
        }
        if (plans.length) {
            const previousRefunds = await this.paymentChannelOperationRepo.find({
                where: { originalOperationId: In(operations.map(operation => operation.id)), operationType: 'REFUND' },
            });
            this.validateRefundPlanAllocations(plans, this.refundCaptureAllocations(
                operations, previousRefunds,
                Number(lines.reduce((sum, line) => sum.plus(line.nominalAmount), new Big(0))),
            ));
        }
        let roundingAccountId: string | undefined;
        if (plans.some(plan => plan.lines.some(line => !new Big(line.nominalAmount).eq(line.providerAmount)))) {
            roundingAccountId = (await this.adminSettingsService.getAdminSettings()).billingAccountId;
            const account = roundingAccountId
                ? await this.paymentChannelOperationRepo.manager.findOneBy(Account, { id: roundingAccountId })
                : null;
            if (!account || account.deactivated || account.isExternal || account.type !== 'COMMERCIAL' ||
                roundingAccountId === purchase.customerAccountId) {
                throw new BadRequestException('An active platform billing account is required for refund rounding adjustments');
            }
        }
        return plans.map(plan => ({ ...plan,
            ...(plan.lines.some(line => !new Big(line.nominalAmount).eq(line.providerAmount)) ? { roundingAccountId } : {}),
        }));
    }

    async totalPaidOrAuthorizedOf(paymentId: string) {
        const paymentOperations = await this.paymentChannelOperationRepo.find({
            where: [
                { paymentId: paymentId, status: 'READY' },
                { paymentId: paymentId, status: 'COMPLETED' },
            ],
        });

        return AmountCalculationUtil.addNumberValues(
            ...paymentOperations.map((op) => op.amount),
        );
    }

    async startRefundPaymentOperationsForRefundRequest(refundRequest: RefundRequestDTO, refundPayment: PaymentFullDTO, purchasePayment: PaymentFullDTO, refundPlans?: RefundChannelPlan[] | RefundChannelPlan) {
        const totalRefundAmount = refundPayment.totalAmount;
        if (!Number.isFinite(totalRefundAmount) || totalRefundAmount < 0 ||
            purchasePayment.paymentStatus !== 'COMPLETED' || purchasePayment.type !== 'PURCHASE') {
            throw new BadRequestException('Refund requires a completed purchase and a valid amount');
        }
        if (totalRefundAmount === 0) {
            return;
        }
        const alreadyCompletedOps = await this.paymentChannelOperationRepo.find({
            where: { paymentId: purchasePayment.id, status: 'COMPLETED', operationType: 'PURCHASE' },
            order: { id: 'ASC' },
        });
        if (!alreadyCompletedOps.length || alreadyCompletedOps.some(op => !op.operationId || op.currency !== refundPayment.currency)) {
            throw new BadRequestException('Completed payment channel operations are required to refund this purchase');
        }
        const plans = refundPlans ? (Array.isArray(refundPlans) ? refundPlans : [refundPlans]) : [];
        const previousRefunds = await this.paymentChannelOperationRepo.find({
            where: {
                originalOperationId: In(alreadyCompletedOps.map(op => op.id)),
                paymentId: Not(refundPayment.id),
                operationType: 'REFUND',
            },
        });
        const allocations = this.refundCaptureAllocations(alreadyCompletedOps, previousRefunds, totalRefundAmount);
        this.validateRefundPlanAllocations(plans, allocations);
        for (const { operation: element, amount: refundAmountForThisOp } of allocations) {
            const refundPlan = plans.find(plan => plan.originalOperationId === element.id);
            const reservation = await this.paymentChannelOperationRepo.manager.transaction(async manager => {
                await manager.findOneOrFail(Payment, {
                    where: { id: refundPayment.id }, lock: { mode: 'pessimistic_write' },
                });
                const existing = await manager.findOne(PaymentChannelOperation, {
                    where: { paymentId: refundPayment.id, originalOperationId: element.id },
                });
                if (existing) {
                    if (!existing.operationId || existing.status === 'FAILED' || existing.amount !== refundAmountForThisOp) {
                        throw new ConflictException(`Refund channel operation ${existing.id} needs reconciliation; it will not be initialized twice`);
                    }
                    return { operation: existing, created: false };
                }
                const operation = new PaymentChannelOperation();
                operation.amount = refundAmountForThisOp;
                operation.currency = refundPayment.currency;
                operation.operationType = 'REFUND';
                operation.paymentChannelId = element.paymentChannelId;
                operation.paymentId = refundPayment.id;
                operation.originalOperationId = element.id;
                if (refundPlan) operation.refundPlan = refundPlan;
                return { operation: await manager.save(PaymentChannelOperation, operation), created: true };
            });
            if (!reservation.created) {
                continue;
            }
            const refundOp = reservation.operation;
            const result = await this.eventSenderService.initializePaymentChannelOperation(
                refundOp.paymentChannelId,
                {
                    ...refundPayment,
                    originalPaymentChannelOperationId: element.operationId,
                    refundOperationId: refundOp.id,
                    ...(refundOp.refundPlan ? { refundPlan: refundOp.refundPlan } : {}),
                    captureInfo: {
                        paymentChannelId: element.paymentChannelId,
                        paidAmount: refundOp.amount,
                        currency: refundPayment.currency,
                    },
                },
            );
            if (!result.paymentChannelOperationId || result.paymentChannelId !== refundOp.paymentChannelId ||
                !['WAITING', 'READY', 'COMPLETED', 'FAILED'].includes(result.paymentStatus)) {
                throw new BadRequestException(`Refund channel operation ${refundOp.id} returned an invalid response; reconciliation is required`);
            }
            await this.savePaymentChannelRecord(refundOp, result, refundPayment.id);
            this.logger.log(`Refund operation ${refundOp.id} created for refund request ${refundRequest.id}`);
            if (refundOp.status === 'FAILED') {
                throw new BadRequestException(`Refund channel operation ${refundOp.id} failed`);
            }
        }
    }

    private refundCaptureAllocations(operations: PaymentChannelOperation[], previousRefunds: PaymentChannelOperation[], total: number) {
        const available = operations.map(operation => {
            const reserved = previousRefunds.filter(refund => refund.originalOperationId === operation.id)
                .reduce((sum, refund) => AmountCalculationUtil.addNumberValues(sum, refund.amount), 0);
            return AmountCalculationUtil.minusNumberValues(operation.amount, reserved);
        });
        let remainingAvailable = AmountCalculationUtil.addNumberValues(...available);
        if (available.some(amount => amount < 0) || total > remainingAvailable) {
            throw new BadRequestException('Refund exceeds the remaining captured channel amount');
        }
        let remaining = total;
        return operations.map((operation, index) => {
            const amount = remainingAvailable === 0 ? 0 : remainingAvailable === available[index]
                ? remaining
                : Number(new Big(remaining).times(available[index]).div(remainingAvailable).round(4, 0));
            remaining = AmountCalculationUtil.minusNumberValues(remaining, amount);
            remainingAvailable = AmountCalculationUtil.minusNumberValues(remainingAvailable, available[index]);
            return { operation, amount };
        }).filter(allocation => allocation.amount > 0);
    }

    private validateRefundPlanAllocations(plans: RefundChannelPlan[], allocations: { operation: PaymentChannelOperation; amount: number }[]) {
        if (new Set(plans.map(plan => plan.originalOperationId)).size !== plans.length ||
            plans.some(plan => {
                const allocation = allocations.find(candidate => candidate.operation.id === plan.originalOperationId);
                return !allocation || plan.originalChannelOperationId !== allocation.operation.operationId ||
                    !plan.lines.reduce((sum, line) => sum.plus(line.nominalAmount), new Big(0)).eq(allocation.amount);
            })) {
            throw new BadRequestException('Channel refund plan does not match the reserved capture amount');
        }
    }

    async startPaymentOperation(paymentFullDto: PaymentFullWithCaptureInfoDTO) {
        const captureInfo = paymentFullDto.captureInfo;
        TypeAssertionUtil.assertIsNumber(
            captureInfo.paidAmount,
            'paidAmount must be a number',
        );

        const paid = await this.totalPaidOrAuthorizedOf(paymentFullDto.id);

        const remainingAmount = paymentFullDto.totalAmount - paid;

        captureInfo.paidAmount = captureInfo.paidAmount || 0;

        if (captureInfo.paidAmount > remainingAmount) {
            captureInfo.paidAmount = remainingAmount;
        }

        if (
            captureInfo.paidAmount !== undefined &&
            captureInfo.paidAmount <= 0
        ) {
            captureInfo.paidAmount = paymentFullDto.totalAmount;
        }

        const { redirectUrl, ...channelCaptureInfo } = captureInfo;
        const returnUrl = redirectUrl === undefined || redirectUrl === null || redirectUrl === ''
            ? null
            : validateReturnUrl(
                redirectUrl,
                (await this.adminSettingsService.getAdminSettings()).allowedReturnOrigins,
            );

        try {
            const result =
                await this.eventSenderService.initializePaymentChannelOperation(
                    captureInfo.paymentChannelId,
                    { ...paymentFullDto, captureInfo: channelCaptureInfo },
                );
            const paymentOperationRecord = new PaymentChannelOperation();
            paymentOperationRecord.amount = captureInfo.paidAmount!;
            paymentOperationRecord.currency = captureInfo.currency;
            paymentOperationRecord.operationType = paymentFullDto.type;
            if (returnUrl) {
                // Kanal, ödeme sonrası tarayıcıyı doğrudan frontende değil Postral'ın return endpoint'ine gönderir.
                paymentOperationRecord.id = randomUUID();
                paymentOperationRecord.returnUrl = returnUrl;
                if (result.redirectUrl) {
                    result.redirectUrl = withChannelReturnUrl(
                        result.redirectUrl,
                        operationReturnPath(paymentOperationRecord.id),
                    );
                }
            }
            return await this.savePaymentChannelRecord(
                paymentOperationRecord,
                result,
                paymentFullDto.id,
            );
        } catch (error: any) {
            console.error(error);
            throw error;
        }
    }

    async checkAndUpdateOperationStatusByOpId(operationId: string): Promise<void> {
        const paymentOperations = await this.paymentChannelOperationRepo.find({
            where: [{ operationId: operationId, status: 'WAITING' }],
        });

        await this.checkAndUpdateOperationStatusesRaw(paymentOperations);
    }

    async checkAndUpdateOperationStatuses(paymentId: string): Promise<void> {
        const paymentOperations = await this.paymentChannelOperationRepo.find({
            where: [{ paymentId: paymentId, status: 'WAITING' }],
        });

        await this.checkAndUpdateOperationStatusesRaw(paymentOperations);
    }

    async sendAllOperationsAreCompletedOrReadyEvent(paymentId: string): Promise<void> {
        const paymentOperations = await this.paymentChannelOperationRepo.find({
            where: [
                { paymentId: paymentId }
            ],
        });

        const completedOrReadyOps = paymentOperations.filter(op => op.status === 'READY' || op.status === 'COMPLETED');
        const waitingOps = paymentOperations.filter(op => op.status === 'WAITING');

        if (waitingOps.length > 0 || (completedOrReadyOps.length === 0)) {
            return;
        }


    }


    private async checkAndUpdateOperationStatusesRaw(
        paymentOperations: PaymentChannelOperation[],
    ) {
        for (let index = 0; index < paymentOperations.length; index++) {
            const paymentOperation = paymentOperations[index];
            if (!paymentOperation.operationId) {
                this.logger.error(`Payment channel operation ${paymentOperation.id} has no channel operation ID; reconciliation is required`);
                continue;
            }
            // Kanala kendi operasyon kimli\u011fi g\u00f6nderilmeli, paymentId de\u011fil; aksi halde ger\u00e7ek
            // kanallarda (operationId \u2260 paymentId oldu\u011funda) yanl\u0131\u015f operasyon sorgulan\u0131r.
            const result =
                await this.eventSenderService.paymentChannelStatusCheck(
                    paymentOperation.paymentChannelId,
                    paymentOperation.operationId,
                );
            await this.savePaymentChannelRecord(
                paymentOperation,
                result,
                paymentOperation.paymentId,
            );


        }
    }

    async cancelPaymentOperationsByPaymentId(id: string) {
        const paymentOperations = await this.paymentChannelOperationRepo.find({
            where: [{ paymentId: id, status: 'WAITING', operationType: 'PURCHASE' }],
        });

        for (let index = 0; index < paymentOperations.length; index++) {
            const paymentOperation = paymentOperations[index];
            // exec(`kdialog --msgbox "Cancelling payment operation ${paymentOperation.operationId}"`)
            const cancellationResult =
                await this.eventSenderService.paymentChannelCancelled(
                    paymentOperation.paymentChannelId,
                    paymentOperation.operationId,
                );

            if (cancellationResult.paymentStatus !== 'FAILED') {
                console.warn(
                    `Payment operation ${paymentOperation.id} could not be cancelled.`,
                );

                // throw new Error(
                //     `Payment operation ${paymentOperation.id} could not be cancelled.`,
                // );
            }

            paymentOperation.status = 'FAILED';
            await this.paymentChannelOperationRepo.save(paymentOperation);
        }
    }

    /** Finds an operation by its Postral record ID (PaymentChannelOperation.id), not the channel's ID. */
    async findOperationRecordById(id: string) {
        return await this.paymentChannelOperationRepo.findOneBy({ id });
    }

    /** Re-validates the stored frontend URL and appends the payment result for the browser redirect. */
    async buildReturnTarget(
        operation: PaymentChannelOperation,
        paymentStatus: string,
    ): Promise<string> {
        const settings = await this.adminSettingsService.getAdminSettings();
        const returnUrl = validateReturnUrl(operation.returnUrl, settings.allowedReturnOrigins);
        return appendReturnParams(returnUrl, {
            paymentId: operation.paymentId,
            operationId: operation.id,
            status: paymentStatus,
        });
    }

    async findOperationById(operationId: string) {
        // operationId burada kanal operasyon kimliğidir (PaymentChannelOperation.operationId), entity PK'sı (id) değil.
        return await this.paymentChannelOperationRepo.findOneBy({
            operationId: operationId,
        });
    }

    /**
     * Yetkilendirilmiş ve tetiklenmeye hazır olan ödeme operasyonlarını tetikler. Genellikle bir ödemenin tamamlanması için tüm operasyonların tamamlanması gerekir, bu yüzden ödeme id'sine göre çekip tetikliyoruz. Ancak bazı durumlarda operasyon bazında da tetikleme yapılabilir, bu durumda operationId'ye göre çekip tetikleyecek bir method daha ekleyebiliriz.
     * @param id 
     */
    async createOpenPaymentOperation(paymentId: string, amount: number, currency: string): Promise<PaymentChannelOperation> {
        const op = new PaymentChannelOperation();
        op.paymentId = paymentId;
        op.paymentChannelId = 'OPEN_PAYMENT';
        op.operationId = 'OPEN_PAYMENT';
        op.amount = amount;
        op.currency = currency;
        op.status = 'COMPLETED';
        op.providerFee = 0;
        op.feeCutInstantly = false;
        op.providerFeeDebitFrom = 'PLATFORM';
        return await this.paymentChannelOperationRepo.save(op);
    }

    async firePaymentOperationsByPaymentId(id: string) {
        const paymentOperations = await this.paymentChannelOperationRepo.find({
            where: [{ paymentId: id, status: 'READY' }],
        });

        for (let index = 0; index < paymentOperations.length; index++) {
            const paymentOperation = paymentOperations[index];
            const result =
                await this.eventSenderService.paymentChannelFireIfAuthorized(
                    paymentOperation.paymentChannelId,
                    paymentOperation.operationId,
                );
            if (result.paymentStatus !== 'COMPLETED') {
                throw new Error(
                    `Payment operation ${paymentOperation.id} could not be completed.`,
                );
            }
            await this.savePaymentChannelRecord(
                paymentOperation,
                result,
                paymentOperation.paymentId,
            );
        }
    }


    /**
     * İşlemde olan ödeme operasyonlarını kontrol eder. Eğer aynı ödeme için birden fazla işlem yapılmasına izin verilmiyorsa, bu method ile mevcut işlemler kontrol edilir ve kullanıcıya bilgi verilir. Bu, özellikle kullanıcıların aynı anda birden fazla ödeme başlatmasını önlemek için önemlidir.
     * @param paymentId Kontrol edilecek ödeme ID'si.
     * @returns OngoingPaymentOperationsResult: İşlemde olan operasyonlar ve durum bilgisi.
     * 
     * Bu method, ödeme operasyonlarının durumunu kontrol etmek için kullanılabilir ve kullanıcı deneyimini iyileştirmek için önemlidir.
     * 
     * Not: Bu method, ödeme operasyonlarının durumunu kontrol etmek için kullanılabilir, ancak ödeme işlemlerinin tamamlanması veya iptal edilmesi gibi işlemleri gerçekleştirmez. Bu işlemler için ilgili servisler kullanılmalıdır.
     * 
     * @returns {Promise<{ ongoing: boolean; message: string; operations?: PaymentChannelOperation[] }>} İşlemde olan operasyonlar ve durum bilgisi.
     * 
     * @throws {Error} Eğer ödeme operasyonları kontrol edilirken bir hata oluşursa, hata fırlatılır.
     * 
     * @example
     * const result = await paymentOperationManagementService.checkOngoingPaymentOperations(paymentId);
     * if (result.ongoing) {
     *     console.log(result.message);
     *     // İşlemde olan operasyonlarla ilgili ek işlemler yapılabilir.
     * } else {
     *     console.log(result.message);
     *     // İşlem başlatılabilir.
     * }
     */
    async hasOngoingPaymentOperations(paymentId: string): Promise<boolean> {

        const operations = await this.paymentChannelOperationRepo.count({
            where: [
                { paymentId: paymentId, status: "READY" },
                { paymentId: paymentId, status: "WAITING" },
                { paymentId: paymentId, status: "COMPLETED" },
            ],
        });
        if (operations > 0) {
            return true;
        }
        return false;
    }


    async hasFailedPaymentOperations(paymentId: string): Promise<boolean> {

        const operations = await this.paymentChannelOperationRepo.count({
            where: [
                { paymentId: paymentId, status: "FAILED" },
            ],
        });
        return operations > 0;
    }
}
