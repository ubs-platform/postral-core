import { PaymentErrorStatus, PaymentOperationFailReason, PaymentOperationStatus, PaymentStatus } from "../type/status";

export class PaymentChannelStatusDTO {
    paymentChannelId!: string;
    paymentChannelOperationId!: string;
    redirectUrl!: string;
    paymentStatus!: PaymentOperationStatus;
    paymentErrorStatus?: PaymentOperationFailReason;
    providerFee?: number;
    /**
     * Komisyon kesintisinin ödeme kanalının kesip kesmediği bilgisini tutar.
     * Eğer true ise, ödeme kanalı provider fee'yi tahsil eder ve kalan tutarı satıcıya öder.
     * Eğer false ise, ödeme kanalı provider fee'yi tahsil etmez ve satıcıya tam tutarı öder, sonradan provider tarafından tahsil edilir.
     * bu bilgi null ya da undefined ise, ödeme kanalının bu konuda bilgi vermediği varsayılarak, feeCutInstantly'nin true olduğu kabul edilir.
     */
    feeCutInstantly?: boolean;
}