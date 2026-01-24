import { PaymentErrorStatus, PaymentOperationStatus, PaymentStatus } from "../type/status";

export class PaymentChannelStatusDTO {
    paymentChannelId?: string;
    paymentChannelOperationId: string;
    redirectUrl: string;
    paymentStatus: PaymentOperationStatus;
    paymentErrorStatus?: PaymentErrorStatus;
}