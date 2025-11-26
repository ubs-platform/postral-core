export class PaymentChannelStatusDTO {
    paymentChannelId: string;
    paymentChannelOperationId: string;
    redirectUrl: string;
    paymentStatus: 'INITIATED' | 'COMPLETED' | 'WAITING' | 'EXPIRED';
}