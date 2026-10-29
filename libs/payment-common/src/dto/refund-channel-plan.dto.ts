export interface RefundChannelLine {
    originalPaymentItemId: string;
    nominalAmount: string;
    providerAmount: string;
}

export interface RefundChannelPlan {
    originalOperationId: string;
    originalChannelOperationId: string;
    channelData?: Record<string, string>;
    roundingAccountId?: string;
    lines: RefundChannelLine[];
}

export class PrepareChannelRefundDTO {
    purchasePaymentId!: string;
    purchaseAmount!: number;
    currency!: string;
    captures!: {
        originalOperationId: string;
        originalChannelOperationId: string;
        paymentChannelId: string;
        amount: number;
    }[];
    items!: { originalPaymentItemId: string; nominalAmount: string }[];
}

export interface PreparedChannelRefund {
    plans: RefundChannelPlan[];
}

export interface RefundSettlement {
    originalPaymentItemId: string;
    providerAmount: string;
}
