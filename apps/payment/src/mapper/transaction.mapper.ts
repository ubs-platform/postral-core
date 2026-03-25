import { Injectable } from '@nestjs/common';
import { Payment } from '../entity/payment.entity';
import { PaymentDTO, PaymentItemDto } from '@tk-postral/payment-common';
import { PaymentTransactionDTO } from '@tk-postral/payment-common';
import { SellerPaymentOrderDTO } from '@tk-postral/payment-common';
import { SellerPaymentOrder } from '../entity';
import { exec } from 'child_process';

@Injectable()
export class TransactionMapper {
    /**
     *
     */
    constructor() {}

    fromPaymentItem(paymentItem: PaymentItemDto, payment: Payment): SellerPaymentOrderDTO {
        const transaction = new SellerPaymentOrderDTO();
        transaction.amount = paymentItem.totalAmount;
        transaction.taxAmount = paymentItem.taxAmount;
        transaction.currency = payment.currency;
        transaction.paymentId = payment.id;
        transaction.sourceAccountId = payment.customerAccountId;
        transaction.targetAccountId = paymentItem.sellerAccountId;
        transaction.paymentStatus = payment.paymentStatus;
        transaction.transactionType = payment.type === 'PURCHASE' ? 'CREDIT_TO_SELLER' : 'DEBIT_FROM_SELLER';
        return transaction;
    }

    toDto(saved: SellerPaymentOrder): PaymentTransactionDTO {
        // exec('kdialog --msgbox "toDto called with id: ' + saved.id + "  Accountlar: " + saved.sourceAccount?.name + " -> " + saved.targetAccount?.name + '" 10 50');
        return {
            amount: saved.amount,
            taxAmount: saved.taxAmount,
            createdAt: saved.createdAt,
            currency: saved.currency,
            id: saved.id,
            paymentId: saved.paymentId,
            paymentStatus: saved.paymentStatus,
            transactionType: saved.sellerOrderType,
            updatedAt: saved.updatedAt,
            description: saved.description,
            errorStatus: saved.errorStatus,
            lastOperationDate: saved.lastOperationDate,
            operationNote: saved.operationNote,
            sourceAccountId: saved.sourceAccountId,
            sourceAccountName: saved.sourceAccount?.name,
            targetAccountId: saved.targetAccountId,
            targetAccountName: saved.targetAccount?.name,
            untaxedAmount: saved.untaxedAmount,
            invoiceCount: saved.invoiceCount,
            hasFinalizedInvoice: saved.hasFinalizedInvoice,
        };
    }
}
