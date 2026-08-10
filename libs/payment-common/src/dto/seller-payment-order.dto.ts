import { PaymentErrorStatus, PaymentStatus } from '../type/status';
import { SellerPaymentOrderType, } from '../type/transaction-type';
import { SnapshotAccountDTO } from './invoice-account.dto';
import { SnapshotAddressDTO } from './invoice-address.dto';



export class SellerPaymentOrderDTO {
    id?: string;
    amount!: number;
    taxAmount!: number;
    untaxedAmount!: number;
    currency!: string;
    paymentId!: string;
    targetAccountId!: string;
    targetAccountName?: string;
    sourceAccountId!: string;
    sourceAccountName?: string;
    billingAddressId?: string;
    paymentStatus!: PaymentStatus;
    errorStatus?: PaymentErrorStatus;
    operationNote!: string;
    transactionType!: SellerPaymentOrderType;
    createdAt!: string | Date;
    updatedAt!: string | Date;
    lastOperationDate!: string | Date;
    description?: string;
    invoiceCount?: number;
    hasFinalizedInvoice?: boolean;
    openPayment?: boolean;
    sellerSnapshotAccountId?: string;
    sellerSnapshotAddressId?: string;
    customerSnapshotAccountId?: string;
    customerSnapshotAddressId?: string;
    sellerSnapshotAccount?: SnapshotAccountDTO;
    sellerSnapshotAddress?: SnapshotAddressDTO;
    customerSnapshotAccount?: SnapshotAccountDTO;
    customerSnapshotAddress?: SnapshotAddressDTO;
}

export class PaymentSellerOrderSearchDTO {
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
    admin: 'true' | 'false' = "false";
    // searchSide?: 'CUSTOMER' | 'SELLER' | "ADMIN";
}

export class PaymentSellerOrderSearchPaginationDTO extends PaymentSellerOrderSearchDTO {
    page: number = 0;
    size: number = 10;
    sortBy: string = 'createdAt';
    sortRotation: 'asc' | 'desc' = 'asc';
}

/**
 * @deprecated This DTO is renamed to SellerPaymentOrderDTO, use that instead. This will be removed in future versions.
 */
export class PaymentTransactionDTO extends SellerPaymentOrderDTO {}

/**
 * @deprecated This DTO is renamed to PaymentSellerOrderSearchPaginationDTO, use that instead. This will be removed in future versions.
 */
export class PaymentTransactionSearchPaginationDTO extends PaymentSellerOrderSearchPaginationDTO {}

/**
 * @deprecated This DTO is renamed to PaymentSellerOrderSearchDTO, use that instead. This will be removed in future versions.
 */
export class PaymentTransactionSearchDTO extends PaymentSellerOrderSearchDTO {}