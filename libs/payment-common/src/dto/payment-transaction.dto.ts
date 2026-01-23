import { PaymentErrorStatus, PaymentStatus } from "../type/status";
import { TransactionType } from "../type/transaction-type";

export class PaymentTransactionDTO {
    id?: string;
    amount: number;
    taxAmount: number;
    untaxedAmount: number;
    currency: string;
    paymentChannelId: string;
    paymentId: string;
    targetAccountId: string;
    sourceAccountId: string;
    paymentStatus: PaymentStatus;
    errorStatus?: PaymentErrorStatus;
    operationNote: string;
    transactionType: TransactionType;
    installmentNumber?: number;
    totalInstallments?: number;
}