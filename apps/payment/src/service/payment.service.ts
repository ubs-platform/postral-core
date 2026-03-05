import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Payment } from '../entity/payment.entity';
import { In, Repository } from 'typeorm';
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
    PaymentFullDTO,
} from '@tk-postral/payment-common';
import { PaymentTaxMapper } from '../mapper/payment-tax.mapper';
import { PaymentCaptureInfoDTO } from '@tk-postral/payment-common/dto/capture-info.dto';
import { PaymentTransactionService } from './transaction.service';
import { AccountService } from './account.service';
import { CalculationService } from './calculation.service';
import { PaymentChannelOperation } from '../entity';
import { ItemCalculationUtil } from '../util/calcs/item-calculations';
import { TypeAssertionUtil } from '../util/type-assertion';
// import { PaymentStatus } from 'dist/libs/payments/type/status';
import { PaymentOperationManagementService } from './payment-operation-management.service';
import { filter, iif, map, Observable, Subject } from 'rxjs';
import { exec } from 'child_process';
import { Optional } from '@ubs-platform/crud-base-common/utils';

@Injectable()
export class PaymentService {
    paymentStream = new Subject<PaymentDTO>();

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
        private paymentOperationManagementService: PaymentOperationManagementService,
    ) {}

    async findAllRaw(): Promise<Payment[]> {
        return this.paymentrepo.find();
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

    async findPaymentById(
        id: string,
        full = false,
    ): Promise<PaymentDTO | PaymentFullDTO> {
        const paymentReal = await this.findPaymentByIdRaw(id, full);
        if (!paymentReal) {
            throw new NotFoundException('Payment not found');
        }
        const paymentItems = full
            ? this.paymentItemMapper.toDto(paymentReal!.items)
            : undefined;
        const paymentTaxes = full
            ? this.paymentTaxMapper.toDto(paymentReal!.taxes)
            : undefined;
        const p = {
            ...this.paymentMapper.toDto(paymentReal!),
            items: paymentItems,
            taxes: paymentTaxes,
        };
        return p;
    }

    private async findPaymentByIdRaw(
        id: string,
        full = false,
    ): Promise<Optional<Payment>> {
        return await this.paymentrepo.findOne({
            where: { id },
            relations: full ? ['items', 'taxes'] : [],
        });
    }

    async generateTransactions(paymentReal: Payment) {
        if (paymentReal.paymentStatus !== 'COMPLETED') {
            throw new Error(
                'Only completed payments can generate transactions.',
            );
        }
        let items: PaymentItemDto[] = [];
        if (paymentReal.items?.length > 0) {
            items = this.paymentItemMapper.toDto(paymentReal.items);
        } else {
            items = await this.findItems(paymentReal.id);
        }
        const transactions: PaymentTransactionDTO[] = [];
        for (let index = 0; index < items.length; index++) {
            const paymentItem = items[index];
            const transaction = new PaymentTransactionDTO();
            transaction.amount = paymentItem.totalAmount;
            transaction.taxAmount = paymentItem.taxAmount;
            transaction.currency = paymentReal.currency;
            transaction.paymentId = paymentReal.id;
            transaction.sourceAccountId = paymentReal.customerAccountId;
            transaction.targetAccountId = paymentItem.sellerAccountId;
            transaction.paymentStatus = paymentReal.paymentStatus;
            transaction.transactionType = 'CREDIT';
            transactions.push(transaction);
        }

        await this.transactionService.addTransactions(transactions);
    }

    async init(pdto: PaymentInitDTO): Promise<PaymentDTO> {
        const customerAccountId = pdto.customerAccountId; // TOOD: Auth'd user id gelmeli...
        const customerAccount =
            await this.accountService.fetchOne(customerAccountId);
        if (pdto.type === "REFUND" && !pdto.refundPaymentId) {
            throw new BadRequestException('Refund payment ID is required for REFUND type');
        }
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
            pi.sellerAccountName = ci.sellerAccountName;
            pi.unit = ci.unit;
            return pi;
        });

        const p = new Payment();
        p.type = pdto.type;
        p.currency = pdto.currency;
        p.totalAmount = totalAmt;
        p.taxAmount = taxTotal;
        p.items = items;
        p.customerAccountId = customerAccountId;
        p.customerAccountName = customerAccount.name;
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
        let payment = await this.findPaymentByIdRaw(id);
        if (!payment) {
            throw new NotFoundException('Payment not found');
        }
        this.assertPaymentIsNotResolved(payment);
        await this.paymentOperationManagementService.cancelPaymentOperationsByPaymentId(
            id,
        );
        payment.paymentStatus = 'FAILED';
        payment.errorStatus = 'CANCELLED';
        payment = await this.paymentrepo.save(payment);
        const dto = this.paymentMapper.toDto(payment);
        this.paymentStream.next(dto);
        return dto;
    }

    private assertPaymentIsNotResolved(payment: Payment) {
        if (
            payment.paymentStatus === 'COMPLETED' ||
            payment.paymentStatus === 'FAILED'
        ) {
            throw new Error(
                'Payment is already resolved and cannot be cancelled again.',
            );
        }
    }

    async startPaymentOperation(
        id: string,
        captureInfo: PaymentCaptureInfoDTO,
    ) {
        let payment = await this.findPaymentByIdRaw(id, true);
        if (!payment) {
            throw new NotFoundException('Payment not found');
        }
        this.assertPaymentIsNotResolved(payment);

        const paymentItems = this.paymentItemMapper.toDto(payment.items); //await this.findItems(id);
        const paymentTaxes = this.paymentTaxMapper.toDto(payment.taxes); //await this.findTaxes(id);

        const result =
            await this.paymentOperationManagementService.startPaymentOperation({
                ...this.paymentMapper.toDto(payment),
                items: paymentItems,
                taxes: paymentTaxes,
                captureInfo: captureInfo,
            });
        payment.paymentStatus = 'WAITING';
        payment = await this.paymentrepo.save(payment);
        const dto = this.paymentMapper.toDto(payment);
        this.paymentStream.next(dto);
        return result;
    }

    // Güncellenmiş ödeme operasyon durumlarına göre ödemeyi günceller
    async updatePaymentByOperationStatuses(id: string) {
        let payment = await this.findPaymentByIdRaw(id);
        if (!payment) {
            throw new NotFoundException('Payment not found');
        }

        if (
            payment.paymentStatus === 'COMPLETED' ||
            payment.paymentStatus === 'FAILED'
        ) {
            return this.paymentMapper.toDto(payment);
        }
        // Ödeme operasyonlarının durumlarını kontrol et ve güncelle
        await this.paymentOperationManagementService.checkAndUpdateOperationStatuses(
            id,
        );

        // Toplam ödenen veya yetkilendirilen miktarı hesapla
        const paidAmount =
            await this.paymentOperationManagementService.totalPaidOrAuthorizedOf(
                id,
            );

        if (paidAmount >= payment.totalAmount) {
            payment.paymentStatus = 'COMPLETED';
        }

        payment = await this.paymentrepo.save(payment);
        const dto = this.paymentMapper.toDto(payment);
        this.paymentStream.next(dto);

        if (payment.paymentStatus === 'COMPLETED') {
            // Ödeme tamamlandıysa, yetkilendirilmiş ödemeleri tetikle
            await this.paymentOperationManagementService.firePaymentOperationsByPaymentId(
                id,
            );
            await this.generateTransactions(payment);
        }
        return dto;
    }

    async handlePaymentOperationStatusUpdated(operationId: string) {
        await this.paymentOperationManagementService.checkAndUpdateOperationStatusByOpId(
            operationId,
        );
        const operation =
            await this.paymentOperationManagementService.findOperationById(
                operationId,
            );
        if (!operation) {
            throw new NotFoundException('Payment operation not found');
        }

        await this.updatePaymentByOperationStatuses(operation.paymentId);

        // await this.payment
    }
}
