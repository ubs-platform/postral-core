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
    status: 'INITIATED' | 'WAITING' | 'COMPLETED' | 'EXPIRED';
    approved: boolean;
}