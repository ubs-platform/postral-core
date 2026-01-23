import { Injectable, NotFoundException, Post } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Payment } from '../entity/payment.entity';
import { Or, Repository } from 'typeorm';
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
import { ItemService } from './item.service';
import { PaymentTaxMapper } from '../mapper/payment-tax.mapper';
import { ItemPriceService } from './item-price.service';
import { PaymentTransaction } from '../entity/transaction.entity';
import { ArrayToObjectUtil } from '../util/array-to-object';
import { error } from 'console';
@Injectable()
export class PaymentTransactionService {

    constructor(
        @InjectRepository(PaymentTransaction)
        private transactionRepository: Repository<PaymentTransaction>,
    ) { }

    toDto(entity: PaymentTransaction): PaymentTransactionDTO {
        const dto = new PaymentTransactionDTO();
        dto.id = entity.id;
        dto.amount = entity.amount;
        dto.currency = entity.currency;
        dto.paymentChannelId = entity.paymentChannelId;
        dto.paymentId = entity.paymentId;
        dto.targetAccountId = entity.targetAccountId;
        dto.sourceAccountId = entity.sourceAccountId;
        dto.paymentStatus = entity.paymentStatus;
        dto.untaxedAmount = entity.untaxedAmount;
        dto.taxAmount = entity.taxAmount;
        dto.transactionType = entity.transactionType;
        dto.operationNote = entity.operationNote;
        dto.errorStatus = entity.errorStatus;
        dto.installmentNumber = entity.installmentNumber;
        dto.totalInstallments = entity.totalInstallments;
        return dto;
    }

    fromDto(dto: PaymentTransactionDTO): PaymentTransaction {
        const entity = new PaymentTransaction();
        if (dto.id) {
            entity.id = dto.id;
        }
        entity.untaxedAmount = TaxCalculationUtil.calculateUntaxedPrice(
            dto.amount,
            dto.taxAmount,
        );
        entity.taxAmount = dto.taxAmount;
        entity.amount = dto.amount;
        entity.currency = dto.currency;
        entity.paymentChannelId = dto.paymentChannelId;
        entity.paymentId = dto.paymentId;
        entity.targetAccountId = dto.targetAccountId;
        entity.sourceAccountId = dto.sourceAccountId;
        entity.paymentStatus = dto.paymentStatus;
        entity.errorStatus = dto.errorStatus;
        entity.transactionType = dto.transactionType;
        entity.operationNote = dto.operationNote;
        entity.installmentNumber = dto.installmentNumber || 0;
        entity.totalInstallments = dto.totalInstallments || 0;
        return entity;
    }

    async calculateRequiredCaptureAmount(paymentId: string): Promise<number> {
        const transactions = await this.transactionRepository.find({ where: [{ paymentId }, Or({ paymentStatus: "COMPLETED" }, { paymentStatus: "WAITING_AUTHORIZED" })], order: { createdAt: 'ASC' } });
        const totale = transactions.reduce((acc, tr) => {
            if (tr.transactionType === 'CREDIT') {
                acc += tr.amount;
            } else if (tr.transactionType === 'DEBIT') {
                acc -= tr.amount;
            }
            return acc;
        }, 0);
        // Implement the logic to calculate the required capture amount based on the transactions
        return totale; // Placeholder return value
    }

    addTransaction(tr: PaymentTransactionDTO): Promise<PaymentTransactionDTO> {
        const entity = this.fromDto(tr);
        this.transactionRepository.save(entity);
        // Save to DB logic here (omitted for brevity)
        return Promise.resolve(this.toDto(entity));
    }

    async addTransactions(transactionsIncoming: PaymentTransactionDTO[]): Promise<void> {
        const transactionGrouped = ArrayToObjectUtil.arrayConditionCirculation(
            transactionsIncoming,
            (a) => {
                return a.sourceAccountId + '|' + a.targetAccountId + '|' + a.paymentId + '|' + a.paymentChannelId + '|' + a.currency + '|' + a.status + '|' + a.approved;
            },
            (object, key, mappingObject) => {
                const mappedObject = mappingObject[key];
                if (mappedObject == null) {
                    mappingObject[key] = {
                        totalAmount: 0,
                        taxAmount: 0,
                        currency: object.currency,
                        paymentChannelId: object.paymentChannelId,
                        paymentId: object.paymentId,
                        sourceAccountId: object.sourceAccountId,
                        targetAccountId: object.targetAccountId,
                        status: object.status,
                        errorStatus: object.errorStatus,
                        operationNote: object.operationNote,
                        transactionType: object.transactionType,

                    };
                }
                mappingObject[key].totalAmount += object.amount;
                mappingObject[key].taxAmount += object.taxAmount;
            }
        );
        for (const tr of transactionsIncoming) {
            await this.addTransaction(tr);
        }
    }

    async getTransactionsByPaymentId(paymentId: string): Promise<PaymentTransactionDTO[]> {
        const transactions = await this.transactionRepository.find({
            where: { paymentId },
            order: { createdAt: 'ASC' }
        });
        return transactions.map(t => this.toDto(t));
    }

    async getTransactionsByPaymentChannelId(paymentChannelId: string): Promise<PaymentTransactionDTO[]> {
        const transactions = await this.transactionRepository.find({
            where: { paymentChannelId },
            order: { createdAt: 'ASC' }
        });
        return transactions.map(t => this.toDto(t));
    }

    async getTransactionsByAccountId(accountId: string): Promise<PaymentTransactionDTO[]> {
        const transactions = await this.transactionRepository.find({
            where: [
                { sourceAccountId: accountId },
                { targetAccountId: accountId }
            ],
            order: { createdAt: 'DESC' }
        });
        return transactions.map(t => this.toDto(t));
    }
}
