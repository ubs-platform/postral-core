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
        private calcService: CalculationService
    ) { }

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

    async editPaymentOperationInformation(
        id: string,
        info: PaymentChannelStatusDTO,
    ) {
        const paymentReal = await this.findPaymentByIdRaw(id);
        if (paymentReal) {
            if (
                paymentReal.paymentStatus === 'FAILED' ||
                paymentReal.paymentStatus === 'COMPLETED'
            ) {
                // already finalized
                return this.paymentMapper.toDto(paymentReal);
            }

            paymentReal.paymentChannelId =
                info.paymentChannelId || paymentReal.paymentChannelId;
            paymentReal.paymentChannelOperationId =
                info.paymentChannelOperationId ||
                paymentReal.paymentChannelOperationId;

            paymentReal.paymentStatus = info.paymentStatus;
            paymentReal.errorStatus = info.paymentErrorStatus;
            const paymentFinal = await this.paymentrepo.save(paymentReal);

            if (paymentReal.paymentStatus === 'COMPLETED') {
                await this.generateTransactions(paymentReal, info);
            }
            return this.paymentMapper.toDto(paymentFinal);

        } else {
            throw new NotFoundException('payment', id);
        }
    }

    async generateTransactions(
        paymentReal: Payment,
        captureInfo: PaymentChannelStatusDTO,
    ) {
        const items = await this.findItems(paymentReal.id);
        const installmentInfo = captureInfo.installmentInfo; // PaymentChannelStatusDTO'ya eklenirse

        for (let index = 0; index < items.length; index++) {
            const paymentItem = items[index];
            const transaction = new PaymentTransactionDTO();
            transaction.amount = paymentItem.totalAmount;
            transaction.taxAmount = paymentItem.taxAmount;
            transaction.untaxedAmount = paymentItem.unTaxAmount;
            transaction.currency = paymentReal.currency;
            transaction.paymentChannelId = captureInfo.paymentChannelId!;
            transaction.paymentId = paymentReal.id;
            transaction.sourceAccountId = paymentReal.customerAccountId;
            transaction.targetAccountId = paymentItem.sellerAccountId;
            transaction.paymentStatus = paymentReal.paymentStatus;
            transaction.transactionType = 'CREDIT';
            transaction.operationNote = `Item: ${paymentItem.name}`;

            // Taksit bilgisi varsa ekle
            if (installmentInfo) {
                transaction.installmentNumber = installmentInfo.installmentNumber;
                transaction.totalInstallments = installmentInfo.totalInstallments;
            }

            await this.transactionService.addTransaction(transaction);
        }
    }

    async init(pdto: PaymentInitDTO): Promise<PaymentDTO> {
        const customerAccountId = pdto.customerAccountId; // TOOD: Auth'd user id gelmeli...
        const customerAccount = await this.accountService.fetchOne(customerAccountId);

        if (!customerAccount) {
            throw new NotFoundException('Customer account not found for payment init');
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
            "paymentChannelId": "",
            "paymentChannelOperationId": "",
            "redirectUrl": "",
            "paymentStatus": "FAILED",
            "paymentErrorStatus": "CANCELLED"
        });

        await this.eventSenderService.paymentChannelCancelled(
            id,
        );

        return payment;
    }

    async startPaymentOperation(
        id: string,
        captureInfo: PaymentCaptureInfoDTO,
    ) {
        const requiredAmount = await this.transactionService.calculateRequiredCaptureAmount(id);
        const paymentDto = await this.findPaymentById(id);
        const paymentItems = await this.findItems(id);
        const paymentTaxes = await this.findTaxes(id);

        if (
            captureInfo.paidAmount !== undefined &&
            captureInfo.paidAmount <= 0
        ) {
            captureInfo.paidAmount = Math.min(requiredAmount, captureInfo.paidAmount);;
        } else {
            captureInfo.paidAmount = requiredAmount;
        }
        try {
            const result = await this.eventSenderService.paymentChannelStarted({
                ...paymentDto,
                items: paymentItems,
                taxes: paymentTaxes,
                captureInfo: captureInfo,
            });
            await this.editPaymentOperationInformation(id, result);
            return result;
        } catch (error) {
            console.error(error);
            throw error;
        }
    }


    async checkPaymentStatus(id: string) {
        const paymentDto = await this.findPaymentById(id);
        const result =
            await this.eventSenderService.paymentChannelStatusChecked(
                paymentDto.paymentChannelId!,
                id,
            );
        await this.editPaymentOperationInformation(id, result);

        // Transaction'ları kontrol et
        const transactions = await this.transactionService.getTransactionsByPaymentId(id);

        return {
            ...result,
            transactions: transactions,
            transactionCount: transactions.length,
            completedTransactions: transactions.filter(t => t.paymentStatus === 'COMPLETED').length
        };
    }
}
