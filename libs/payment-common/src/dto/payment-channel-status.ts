import { PaymentErrorStatus, PaymentStatus } from "../type/status";

export interface InstallmentInfo {
    installmentNumber: number;
    totalInstallments: number;
}

export class PaymentChannelStatusDTO {
    paymentChannelId?: string;
    paymentChannelOperationId: string;
    redirectUrl: string;
    paymentStatus: PaymentStatus;
    paymentErrorStatus?: PaymentErrorStatus;
    installmentInfo?: InstallmentInfo;
}