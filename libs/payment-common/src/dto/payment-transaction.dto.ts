export class PaymentTransactionDTO {
    id?: string;
    amount: number;
    currency: string;
    paymentChannelId: string;
    paymentId: string;
    targetAccountId: string;
    sourceAccountId: string;
    status: 'INITIATED' | 'PENDING' | 'COMPLETED' | 'FAILED' | 'CANCELLED';
    approved: boolean;
}