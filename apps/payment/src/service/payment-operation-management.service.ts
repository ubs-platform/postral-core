import { Injectable, Logger } from '@nestjs/common';
import { Payment, PaymentChannelOperation } from '../entity';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { PaymentItemMapper } from '../mapper/payment-item.mapper';
import { PaymentTaxMapper } from '../mapper/payment-tax.mapper';
import { PaymentMapper } from '../mapper/payment.mapper';
import { AccountService } from './account.service';
import { CalculationService } from './calculation.service';
import { EventSenderService } from './event-management.service';
import {
    PaymentChannelStatusDTO,
    PaymentCaptureInfoDTO,
    PaymentDTO,
    PaymentFullDTO,
    RefundRequestDTO,
} from '@tk-postral/payment-common';
import { TypeAssertionUtil } from '../util/type-assertion';
import { ItemCalculationUtil } from '../util/calcs/item-calculations';
import { PaymentFullWithCaptureInfoDTO } from '@tk-postral/payment-common';
import { Cron } from '@nestjs/schedule';
import { RatioCalculationUtil } from '../util/calcs/ratio-calculations';
import { exec } from 'child_process';
import { AdminSettingsService } from './admin-settings.service';

@Injectable()
export class PaymentOperationManagementService {

    /**
     *
     */
    constructor(
        private eventSenderService: EventSenderService,
        private calcService: CalculationService,
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
        const stgs = await this.adminSettingsService.getAdminSettings();

        paymentOperationRecord.operationId = result.paymentChannelOperationId!;
        paymentOperationRecord.paymentId = paymentId;
        paymentOperationRecord.paymentChannelId = result.paymentChannelId!;
        paymentOperationRecord.status = result.paymentStatus;
        paymentOperationRecord.providerFee = result.providerFee || 0;
        paymentOperationRecord.feeCutInstantly = result.feeCutInstantly ?? true;
        paymentOperationRecord.providerFeeDebitFrom = stgs.sellerPaysPaymentServiceFee ? 'SELLER' : 'PLATFORM';
        await this.paymentChannelOperationRepo.save(paymentOperationRecord);
        return result;
    }

    async totalPaidOrAuthorizedOf(paymentId: string) {
        const paymentOperations = await this.paymentChannelOperationRepo.find({
            where: [
                { paymentId: paymentId, status: 'READY' },
                { paymentId: paymentId, status: 'COMPLETED' },
            ],
        });

        return ItemCalculationUtil.addNumberValues(
            ...paymentOperations.map((op) => op.amount),
        );
    }

    async startRefundPaymentOperationsForRefundRequest(refundRequest: RefundRequestDTO, refundPayment: PaymentFullDTO, purchasePayment: PaymentFullDTO) {
        const totalRefundAmount = refundPayment.totalAmount;
        const totalPaidAmount = purchasePayment.totalAmount;

        const refundRatio = RatioCalculationUtil.calculateRefundRatio(totalRefundAmount, totalPaidAmount);

        const alreadyCompletedOps = await this.paymentChannelOperationRepo.find({
            where: [
                { paymentId: purchasePayment.id, status: 'COMPLETED' },
            ],
        });
        for (let index = 0; index < alreadyCompletedOps.length; index++) {
            const element = alreadyCompletedOps[index];
            const refundAmountForThisOp = RatioCalculationUtil.multiplyTwoValues(element.amount, refundRatio);
            if (refundAmountForThisOp <= 0) {
                continue;
            }
            const refundOp = new PaymentChannelOperation();

            refundOp.amount = refundAmountForThisOp;
            refundOp.currency = purchasePayment.currency;
            refundOp.paymentChannelId = element.paymentChannelId;
            refundOp.paymentId = refundPayment.id;
            // refundOperationsToCreate.push(refundOp);
            const result = await this.eventSenderService.initializePaymentChannelOperation(
                refundOp.paymentChannelId,
                refundPayment,
            );

            refundOp.operationId = result.paymentChannelOperationId;
            refundOp.status = result.paymentStatus;

            const saved = await this.paymentChannelOperationRepo.save(refundOp);
            console.debug(`Refund operation created with ID: ${saved.id} for refund request ${refundRequest.id}`);
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

        try {
            const result =
                await this.eventSenderService.initializePaymentChannelOperation(
                    captureInfo.paymentChannelId,
                    paymentFullDto,
                );
            const paymentOperationRecord = new PaymentChannelOperation();
            paymentOperationRecord.amount = captureInfo.paidAmount!;
            paymentOperationRecord.currency = captureInfo.currency;
            return await this.savePaymentChannelRecord(
                paymentOperationRecord,
                result,
                paymentFullDto.id,
            );
        } catch (error) {
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
            const result =
                await this.eventSenderService.paymentChannelStatusCheck(
                    paymentOperation.paymentChannelId,
                    paymentOperation.paymentId,
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
            where: [{ paymentId: id, status: 'WAITING' }],
        });

        for (let index = 0; index < paymentOperations.length; index++) {
            const paymentOperation = paymentOperations[index];
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

    async findOperationById(operationId: string) {
        return await this.paymentChannelOperationRepo.findOneBy({
            id: operationId,
        });
    }

    /**
     * Yetkilendirilmiş ve tetiklenmeye hazır olan ödeme operasyonlarını tetikler. Genellikle bir ödemenin tamamlanması için tüm operasyonların tamamlanması gerekir, bu yüzden ödeme id'sine göre çekip tetikliyoruz. Ancak bazı durumlarda operasyon bazında da tetikleme yapılabilir, bu durumda operationId'ye göre çekip tetikleyecek bir method daha ekleyebiliriz.
     * @param id 
     */
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
            // Update status after firing
            paymentOperation.status = 'COMPLETED';
            await this.paymentChannelOperationRepo.save(paymentOperation);
        }
    }
}
