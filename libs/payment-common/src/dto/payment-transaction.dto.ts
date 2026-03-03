import { PaymentErrorStatus, PaymentStatus } from '../type/status';
import { TransactionType } from '../type/transaction-type';

export class PaymentTransactionDTO {
    id?: string;
    amount: number;
    taxAmount: number;
    untaxedAmount: number;
    currency: string;
    paymentId: string;
    targetAccountId: string;
    targetAccountName?: string;
    sourceAccountId: string;
    sourceAccountName?: string;
    paymentStatus: PaymentStatus;
    errorStatus?: PaymentErrorStatus;
    operationNote: string;
    transactionType: TransactionType;
    createdAt: string | Date;
    updatedAt: string | Date;
    lastOperationDate: string | Date;
    description?: string;
    invoiceCount?: number;
    hasFinalizedInvoice?: boolean;
}

export class PaymentTransactionSearchDTO {
    id?: string;
    paymentId?: string;
    // Çoklu arama için virgül ile ayrılmış değerler
    targetAccountIds?: string;
    // Çoklu arama için virgül ile ayrılmış değerler
    sourceAccountIds?: string;
    paymentStatus?: PaymentStatus;
    currency?: string;
    dateFrom?: string;
    dateTo?: string;
    admin: 'true' | 'false';
    // searchSide?: 'CUSTOMER' | 'SELLER' | "ADMIN";
}

export class PaymentTransactionSearchPaginationDTO extends PaymentTransactionSearchDTO {
    page: number;
    size: number;
    sortBy: string;
    sortRotation: 'asc' | 'desc';
}
