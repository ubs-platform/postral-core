export class PaymentChannelStatusDTO {
    operationId: string;
    redirectUrl: string;
    currentStatus: 'INITIATED' | 'COMPLETED' | 'WAITING' | 'EXPIRED';
}