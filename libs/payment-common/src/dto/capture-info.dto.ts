export interface PaymentCaptureInfoDTO {
    // Ödeme metodu, şimdilik dummy kalmalı
    paidAmount?: number;
    paymentChannelId: string;
    currency: string;
    // paymentId: number;
}