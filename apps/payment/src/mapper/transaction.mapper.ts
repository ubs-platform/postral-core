import { Injectable } from '@nestjs/common';
import { Payment } from '../entity/payment.entity';
import { PaymentDTO } from '@tk-postral/payment-common';
import { PaymentTransactionDTO } from '@tk-postral/payment-common';
import { PaymentTransaction } from '../entity';

@Injectable()
export class TransactionMapper {

    /**
     *
     */
    constructor() {

    }

    toDto(saved: PaymentTransaction): PaymentTransactionDTO {
        return {
            amount: saved.amount,
            taxAmount: saved.taxAmount,
            createdAt: saved.createdAt,
            currency: saved.currency,
            id: saved.id,
            paymentId: saved.paymentId,
            paymentStatus: saved.paymentStatus,
            transactionType: saved.transactionType,
            updatedAt: saved.updatedAt,
            description: saved.description,
            errorStatus: saved.errorStatus,
            lastOperationDate: saved.lastOperationDate,
            operationNote: saved.operationNote,
            sourceAccountId: saved.sourceAccountId,
            targetAccountId: saved.targetAccountId,
            untaxedAmount: saved.untaxedAmount,
        };
    }
}
