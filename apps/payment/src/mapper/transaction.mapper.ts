import { Injectable } from '@nestjs/common';
import { Payment, SellerPaymentOrder } from '@tk-postral/postral-entities';
import { PaymentDTO, PaymentItemDTO } from '@tk-postral/payment-common';
import { PaymentTransactionDTO } from '@tk-postral/payment-common';
import { SellerPaymentOrderDTO } from '@tk-postral/payment-common';
import { exec } from 'child_process';
import { InvoiceAddressMapper } from './invoice-address.mapper';
import { InvoiceAccountMapper } from './invoice-account.mapper';

@Injectable()
export class TransactionMapper {
    /**
     *
     */
    constructor(private snapshotAddressMapper: InvoiceAddressMapper, private snapshotAccountMapper: InvoiceAccountMapper) { }

    fromPaymentItem(paymentItem: PaymentItemDTO, payment: Payment): SellerPaymentOrderDTO {
        const transaction = new SellerPaymentOrderDTO();
        transaction.amount = paymentItem.totalAmount;
        transaction.taxAmount = paymentItem.taxAmount;
        transaction.currency = payment.currency;
        transaction.paymentId = payment.id;
        transaction.sourceAccountId = payment.customerAccountId!;
        transaction.targetAccountId = paymentItem.sellerAccountId!;
        transaction.billingAddressId = payment.billingAddressId;
        transaction.paymentStatus = payment.paymentStatus;
        transaction.transactionType = payment.type === 'PURCHASE' ? 'CREDIT_TO_SELLER' : 'DEBIT_FROM_SELLER';
        transaction.openPayment = payment.openPayment;
        transaction.sellerSnapshotAccountId = paymentItem.sellerSnapshotAccountId;
        transaction.sellerSnapshotAddressId = paymentItem.sellerSnapshotAddressId;
        transaction.customerSnapshotAccountId = payment.customerSnapshotAccountId;
        transaction.customerSnapshotAddressId = payment.customerSnapshotAddressId;
        return transaction;
    }

    toDto(saved: SellerPaymentOrder, full = false): SellerPaymentOrderDTO {
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
            billingAddressId: saved.billingAddressId,
            untaxedAmount: saved.untaxedAmount,
            invoiceCount: saved.invoiceCount,
            hasFinalizedInvoice: saved.hasFinalizedInvoice,
            openPayment: saved.openPayment,
            sellerSnapshotAccountId: saved.sellerSnapshotAccountId,
            customerSnapshotAccountId: saved.customerSnapshotAccountId,
            sellerSnapshotAddressId: saved.sellerSnapshotAddressId,
            customerSnapshotAddressId: saved.customerSnapshotAddressId,
            sellerSnapshotAccount: (full && saved.sellerSnapshotAccount) ? this.snapshotAccountMapper.toDto(saved.sellerSnapshotAccount) : undefined,
            customerSnapshotAccount: (full && saved.customerSnapshotAccount) ? this.snapshotAccountMapper.toDto(saved.customerSnapshotAccount) : undefined,
            customerSnapshotAddress: (full && saved.customerSnapshotAddress) ? this.snapshotAddressMapper.toDto(saved.customerSnapshotAddress) : undefined,
            sellerSnapshotAddress: (full && saved.sellerSnapshotAddress) ? this.snapshotAddressMapper.toDto(saved.sellerSnapshotAddress) : undefined,
        };
    }
}
