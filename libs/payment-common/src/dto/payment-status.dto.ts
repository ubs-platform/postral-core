export class PaymentStatusDTO {
    paymentId: string;
    paymentOperationId?: string;
    paymentOperationRedirectUrl?: string;
    status: 'COMPLETED' | 'WAITING' | 'EXPIRED';
    amount: number;
    currency: string;
}
