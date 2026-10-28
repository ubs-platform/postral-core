export class PaymentCaptureInfoDTO {
    // Ödeme metodu, şimdilik dummy kalmalı
    paidAmount?: number;
    paymentChannelId: string;
    currency: string;
    /** Set by the HTTP server, never trusted from the request body. */
    buyerIp?: string;
    /**
     * Absolute frontend URL to return to after the payment page. Postral sends the
     * browser there through its own return endpoint after checking the payment.
     * In production its origin must be in `AdminSettingsDto.allowedReturnOrigins`.
     */
    redirectUrl?: string;
    // paymentId: number;
}