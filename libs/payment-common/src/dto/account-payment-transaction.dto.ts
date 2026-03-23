import { PaymentStatus } from '@tk-postral/payment-common';


export class AccountPaymentTransactionDTO {
   
    id: string;

    corelationId: string;

    // uuid
    accountId: string;

    accountName: string;

    paymentId: string;

    paymentSellerOrderId?: string;

    type: "DEBIT" | "CREDIT";

    status: PaymentStatus;

    amount: number;

    taxAmount: number;

    creationDate: Date;

    updateDate: Date;

    operationNote : string;

    description: string;
}