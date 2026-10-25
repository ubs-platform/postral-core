export class PaymentCaptureInfoDTO {
    // Ödeme metodu, şimdilik dummy kalmalı
    paidAmount?: number;
    paymentChannelId: string;
    currency: string;
    /** Set by the HTTP server, never trusted from the request body. */
    buyerIp?: string;
    // paymentId: number;
}