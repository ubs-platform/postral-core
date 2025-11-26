import { Injectable, NotFoundException, Post } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Payment } from '../entity/payment.entity';
import { Repository } from 'typeorm';
import { PostralPaymentItem } from '../entity/payment-item.entity';
import { PaymentMapper } from '../mapper/payment.mapper';
import { PaymentItemMapper } from '../mapper/payment-item.mapper';
import { TaxCalculationUtil } from '../util/calculations';
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
@Injectable()
export class PaymentTransactionService {

    constructor(
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
        dto.status = entity.status;
        dto.approved = entity.approved;
        return dto;
    }

    fromDto(dto: PaymentTransactionDTO): PaymentTransaction {
        const entity = new PaymentTransaction();
        if (dto.id) {
            entity.id = dto.id;
        }
        entity.amount = dto.amount;
        entity.currency = dto.currency;
        entity.paymentChannelId = dto.paymentChannelId;
        entity.paymentId = dto.paymentId;
        entity.targetAccountId = dto.targetAccountId;
        entity.sourceAccountId = dto.sourceAccountId;
        entity.status = dto.status;
        entity.approved = dto.approved;
        return entity;
    }



    addTransaction(tr: PaymentTransactionDTO): Promise<PaymentTransactionDTO> {
        const entity = this.fromDto(tr);
        this.transactionRepository.save(entity);
        // Save to DB logic here (omitted for brevity)
        return Promise.resolve(this.toDto(entity));
    }

}