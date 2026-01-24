import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Payment } from '../entity/payment.entity';
import { Repository } from 'typeorm';
import { PostralPaymentItem } from '../entity/payment-item.entity';
import { PaymentMapper } from '../mapper/payment.mapper';
import { PaymentItemMapper } from '../mapper/payment-item.mapper';
import { TaxCalculationUtil } from '../util/calcs/tax-calculations';
import { PostralPaymentTax } from '../entity/payment-tax.entity';
import { EventSenderService } from './event-management.service';
import {
    PaymentItemDto,
    PaymentInitDTO,
    PaymentDTO,
    TaxDTO,
    PaymentTransactionDTO,
} from '@tk-postral/payment-common';
import { PaymentTaxMapper } from '../mapper/payment-tax.mapper';
import { PaymentCaptureInfoDTO } from '@tk-postral/payment-common/dto/capture-info.dto';
import { PaymentTransactionService } from './transaction.service';
import { PaymentChannelStatusDTO } from '@tk-postral/payment-common/dto/payment-channel-status';
import { AccountService } from './account.service';
import { CalculationService } from './calculation.service';
import { PaymentChannelOperation } from '../entity';
import { ItemCalculationUtil } from '../util/calcs/item-calculations';
import { TypeAssertionUtil } from '../util/type-assertion';
import { PaymentStatus } from 'dist/libs/payments/type/status';

@Injectable()
export class PaymentService {
    constructor(
        @InjectRepository(Payment)
        private readonly paymentrepo: Repository<Payment>,
        private paymentMapper: PaymentMapper,
        private paymentItemMapper: PaymentItemMapper,
        private paymentTaxMapper: PaymentTaxMapper,
        private eventSenderService: EventSenderService,
        private transactionService: PaymentTransactionService,
        private accountService: AccountService,
        private calcService: CalculationService,
        @InjectRepository(PaymentChannelOperation)
        private readonly paymentChannelOperationRepo: Repository<PaymentChannelOperation>,
    ) {}

    async findAllRaw(): Promise<Payment[]> {
        return this.paymentrepo.find();
    }
    async findAll(): Promise<PaymentDTO[]> {
        return (await this.findAllRaw()).map((p) =>
            this.paymentMapper.toDto(p),
        );
    }

    async findItems(id: string): Promise<PaymentItemDto[]> {
        const ac = await this.paymentrepo.find({
            relations: { items: true },
            where: { id: id },
        });
        return this.paymentItemMapper.toDto(ac[0].items);
    }

    async findTaxes(id: string): Promise<TaxDTO[]> {
        const ac = await this.paymentrepo.find({
            relations: { taxes: true },
            where: { id: id },
        });
        return this.paymentTaxMapper.toDto(ac[0].taxes);
    }

    async findPaymentById(id: string) {
        const paymentReal = await this.findPaymentByIdRaw(id);
        const p = this.paymentMapper.toDto(paymentReal!);
        return p;
    }

    private async findPaymentByIdRaw(id: string): Promise<Payment | undefined> {
        return (
            await this.paymentrepo.find({
                where: { id },
            })
        )[0];
    }

    async generateTransactions(
        paymentReal: Payment,
        captureInfo: PaymentChannelStatusDTO,
    ) {
        const items = await this.findItems(paymentReal.id);
        for (let index = 0; index < items.length; index++) {
            const paymentItem = items[index];
            const transaction = new PaymentTransactionDTO();
            transaction.amount = paymentItem.totalAmount;
            transaction.taxAmount = paymentItem.taxAmount;
            transaction.currency = paymentReal.currency;
            transaction.paymentChannelId = captureInfo.paymentChannelId!;
            transaction.paymentId = paymentReal.id;
            transaction.sourceAccountId = paymentReal.customerAccountId;
            transaction.targetAccountId = paymentItem.sellerAccountId;
            transaction.paymentStatus = paymentReal.paymentStatus;
            transaction.transactionType = 'CREDIT';
            await this.transactionService.addTransaction(transaction);
        }
    }

    async init(pdto: PaymentInitDTO): Promise<PaymentDTO> {
        const customerAccountId = pdto.customerAccountId; // TOOD: Auth'd user id gelmeli...
        const customerAccount =
            await this.accountService.fetchOne(customerAccountId);

        if (!customerAccount) {
            throw new NotFoundException(
                'Customer account not found for payment init',
            );
        }

        if (pdto.saleMode === undefined || pdto.saleMode.trim() === '') {
            pdto.saleMode = 'DEFAULT';
        }

        let taxesFromItems: TaxDTO[] = [],
            items: PostralPaymentItem[] = [];
        // transactions: {[sourceAccountId: string]: PaymentTransactionDTO} = {};
        let totalAmt = 0,
            taxTotal = 0;

        const calculationResult = await this.calcService.calculateTotalAmount({
            items: pdto.items,
            saleMode: pdto.saleMode,
            currency: pdto.currency,
        });

        totalAmt = calculationResult.totalAmount;
        taxTotal = calculationResult.totalTaxAmount;
        taxesFromItems = calculationResult.taxes;

        items = calculationResult.items.map((ci) => {
            const pi = new PostralPaymentItem();
            pi.itemId = ci.itemId;
            pi.name = ci.name;
            pi.quantity = ci.quantity;
            pi.unitAmount = ci.unitAmount;
            pi.originalUnitAmount = ci.originalUnitAmount;
            pi.totalAmount = ci.totalAmount;
            pi.taxPercent = ci.taxPercent;
            pi.taxAmount = ci.taxAmount;
            pi.unTaxAmount = ci.unTaxAmount;
            pi.variation = ci.variation;
            pi.entityGroup = ci.entityGroup;
            pi.entityId = ci.entityId;
            pi.entityName = ci.entityName;
            pi.sellerAccountId = ci.sellerAccountId;
            pi.entityOwnerAccountId = ci.entityOwnerAccountId;
            return pi;
        });

        const p = new Payment();
        p.type = pdto.type;
        p.currency = pdto.currency;
        p.totalAmount = totalAmt;
        p.taxAmount = taxTotal;
        p.items = items;
        p.customerAccountId = customerAccountId;
        p.paymentStatus = 'INITIATED';
        p.taxes = TaxCalculationUtil.mergeTaxesByPercent(taxesFromItems).map(
            (a) => {
                const ppt = new PostralPaymentTax();
                ppt.fullAmount = a.fullAmount;
                ppt.percent = a.percent;
                ppt.taxAmount = a.taxAmount;
                ppt.untaxAmount = a.untaxAmount;
                return ppt;
            },
        );
        const paymentSaved = await this.paymentrepo.save(p);
        const paymentDtoFinal = this.paymentMapper.toDto(paymentSaved);
        try {
            await this.eventSenderService.onPaymentInitialized(paymentDtoFinal);
        } catch (error) {
            console.error(error);
        }
        return paymentDtoFinal;
    }

    async cancelPayment(id: string) {
        const payment = await this.editPaymentOperationInformation(id, {
            paymentChannelId: '',
            paymentChannelOperationId: '',
            redirectUrl: '',
            paymentStatus: 'FAILED',
            paymentErrorStatus: 'CANCELLED',
        });

        await this.eventSenderService.paymentChannelCancelled(id);

        return payment;
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

    async startPaymentOperation(
        id: string,
        captureInfo: PaymentCaptureInfoDTO,
    ) {
        TypeAssertionUtil.assertIsNumber(
            captureInfo.paidAmount,
            'paidAmount must be a number',
        );

        const paymentDto = await this.findPaymentById(id);
        const paymentItems = await this.findItems(id);
        const paymentTaxes = await this.findTaxes(id);
        const paid = await this.totalPaidOrAuthorizedOf(id);

        const remainingAmount = paymentDto.totalAmount - paid;

        captureInfo.paidAmount = captureInfo.paidAmount || 0;

        if (captureInfo.paidAmount > remainingAmount) {
            captureInfo.paidAmount = remainingAmount;
        }

        if (
            captureInfo.paidAmount !== undefined &&
            captureInfo.paidAmount <= 0
        ) {
            captureInfo.paidAmount = paymentDto.totalAmount;
        }

        try {
            const result = await this.eventSenderService.paymentChannelStarted({
                ...paymentDto,
                items: paymentItems,
                taxes: paymentTaxes,
                captureInfo: captureInfo,
            });
            const paymentOperationRecord = new PaymentChannelOperation();
            paymentOperationRecord.amount = captureInfo.paidAmount!;

            return await this.savePaymentChannelRecord(
                paymentOperationRecord,
                result,
                id,
            );

            // await this.editPaymentOperationInformation(id, result);
            // return result;
        } catch (error) {
            console.error(error);
            throw error;
        }
    }

    async checkAndUpdateOperationStatuses(
        paymentId: string,
    ): Promise<PaymentChannelStatusDTO> {
        const paymentOperations = await this.paymentChannelOperationRepo.find({
            where: [{ paymentId: paymentId, status: 'WAITING' }],
        });

        for (let index = 0; index < paymentOperations.length; index++) {
            const paymentOperation = paymentOperations[index];
            const result =
                await this.eventSenderService.paymentChannelStatusChecked(
                    paymentOperation.paymentChannelId,
                    paymentId,
                );
            await this.savePaymentChannelRecord(
                paymentOperation,
                result,
                paymentId,
            );
        }

        const finalResult =
            await this.eventSenderService.paymentChannelStatusChecked(
                '',
                paymentId,
            );
        return finalResult;
    }

    private async savePaymentChannelRecord(
        paymentOperationRecord: PaymentChannelOperation,
        result: PaymentChannelStatusDTO,
        paymentId: string,
    ) {
        paymentOperationRecord.id = result.paymentChannelOperationId!;
        paymentOperationRecord.operationId = result.paymentChannelOperationId!;
        paymentOperationRecord.paymentId = paymentId;
        paymentOperationRecord.paymentChannelId = result.paymentChannelId!;
        paymentOperationRecord.status = result.paymentStatus;

        await this.paymentChannelOperationRepo.save(paymentOperationRecord);
        return result;
    }

    async updatePaymentByOperationStatuses(id: string) {
        const payment = await this.findPaymentByIdRaw(id);
        if (!payment) {
            throw new NotFoundException('Payment not found');
        }

        const paidAmount = await this.totalPaidOrAuthorizedOf(id);

        if (paidAmount >= payment.totalAmount) {
            payment.paymentStatus = 'COMPLETED';
        }

        await this.paymentrepo.save(payment);

        if (payment.paymentStatus === 'COMPLETED') {
            // TODO: Ön onaydaki ödeme operasyonları da tamamlama sinyali gönderilecek.
            
        }
        return this.paymentMapper.toDto(payment);
  
    }
}
