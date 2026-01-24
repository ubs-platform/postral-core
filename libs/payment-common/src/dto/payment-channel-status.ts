import { PaymentErrorStatus, PaymentStatus } from "../type/status";

export class PaymentChannelStatusDTO {
    paymentChannelId?: string;
    paymentChannelOperationId: string;
    redirectUrl: string;
    paymentStatus: PaymentStatus;
    paymentErrorStatus?: PaymentErrorStatus;
}