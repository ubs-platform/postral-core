import { PaymentErrorStatus, PaymentOperationFailReason, PaymentOperationStatus, PaymentStatus } from "../type/status";

export class PaymentChannelStatusDTO {
    paymentChannelId: string;
    paymentChannelOperationId: string;
    redirectUrl: string;
    paymentStatus: PaymentOperationStatus;
    paymentErrorStatus?: PaymentOperationFailReason;
}