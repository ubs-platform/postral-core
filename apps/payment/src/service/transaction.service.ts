import { Injectable, NotFoundException, Post } from '@nestjs/common';
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
import { ItemService } from './item.service';
import { PaymentTaxMapper } from '../mapper/payment-tax.mapper';
import { ItemPriceService } from './item-price.service';
import { SellerPaymentOrder } from '../entity/transaction.entity';
import { ArrayToObjectUtil } from '../util/array-to-object';
import { error } from 'console';
@Injectable()
export class SellerPaymentOrderService {
    constructor(
        @InjectRepository(SellerPaymentOrder)
        private transactionRepository: Repository<SellerPaymentOrder>,
    ) {}

    toDto(entity: SellerPaymentOrder): PaymentTransactionDTO {
        const dto = new PaymentTransactionDTO();
        dto.id = entity.id;
        dto.amount = entity.amount;
        dto.currency = entity.currency;
        dto.paymentId = entity.paymentId;
        dto.targetAccountId = entity.targetAccountId;
        dto.sourceAccountId = entity.sourceAccountId;
        dto.paymentStatus = entity.paymentStatus;
        dto.untaxedAmount = entity.untaxedAmount;
        dto.taxAmount = entity.taxAmount;
        return dto;
    }

    fromDto(dto: PaymentTransactionDTO): SellerPaymentOrder {
        const entity = new SellerPaymentOrder();
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
        entity.paymentId = dto.paymentId;
        entity.targetAccountId = dto.targetAccountId;
        entity.sourceAccountId = dto.sourceAccountId;
        entity.paymentStatus = dto.paymentStatus;
        entity.errorStatus = dto.errorStatus;
        entity.sellerOrderType = dto.transactionType;
        entity.operationNote = dto.operationNote;
        return entity;
    }

    async addTransaction(
        tr: PaymentTransactionDTO,
    ): Promise<PaymentTransactionDTO> {
        // zaten varsa varolanın durumunu vs. güncelle, yoksa yenisini ekle. Miktar değişmeyecek.
        const existing = await this.transactionRepository.findOne({
            where: {
                sourceAccountId: tr.sourceAccountId,
                targetAccountId: tr.targetAccountId,
                sellerOrderType: tr.transactionType,
                paymentId: tr.paymentId,
                currency: tr.currency,
            },
        });
        // debugger
        if (existing) {
            existing.paymentStatus = tr.paymentStatus;
            existing.updatedAt = new Date();
            existing.errorStatus = tr.errorStatus;
            existing.operationNote = tr.operationNote;
            await this.transactionRepository.save(existing);
            return this.toDto(existing);
        }
        
        const entity = this.fromDto(tr);
        await this.transactionRepository.save(entity);
        // Save to DB logic here (omitted for brevity)
        return await this.toDto(entity);
    }

    async addSellerPaymentOrders(
        transactions: PaymentTransactionDTO[],
    ): Promise<void> {
        const transactionGrouped = ArrayToObjectUtil.arrayConditionCirculation(
            transactions,
            (a: PaymentTransactionDTO) => {
                return (
                    a.sourceAccountId +
                    '|' +
                    a.targetAccountId +
                    '|' +
                    a.transactionType +
                    '|' +
                    a.paymentId +
                    '|' +
                    a.currency +
                    '|' +
                    a.paymentStatus
                );
            },
            (object, key, mappingObject) => {
                const mappedObject = mappingObject[key];
                if (mappedObject == null) {
                    mappingObject[key] = {
                        amount: 0,
                        taxAmount: 0,
                        currency: object.currency,
                        paymentId: object.paymentId,
                        sourceAccountId: object.sourceAccountId,
                        targetAccountId: object.targetAccountId,
                        paymentStatus: object.paymentStatus,
                        errorStatus: object.errorStatus,
                        operationNote: object.operationNote,
                        transactionType: object.transactionType,
                    } as PaymentTransactionDTO;
                }
                const ptdto = mappingObject[key] as PaymentTransactionDTO;
                ptdto.amount += object.amount;
                ptdto.taxAmount += object.taxAmount;
            },
        );

        const values = Object.values(transactionGrouped).flat().flat();
        for (const tr of values) {
            await this.addTransaction(tr as PaymentTransactionDTO);
        }
    }

    async updateInvoiceStatus(
        id: string,
        invoiceCount: number,
        hasFinalizedInvoice: boolean,
    ): Promise<void> {
        await this.transactionRepository.update(id, {
            invoiceCount,
            hasFinalizedInvoice,
        });
    }
}
