export type RefundRequestStatus = 'PENDING' | 'APPROVED' | 'REJECTED';


export class RefundRequestItemDTO {
    paymentItemId: string;
    refundCount: number;
}

export class CreateRefundRequestDTO {
    paymentId: string;
    items: RefundRequestItemDTO[];
}

export interface RefundRequestItem {
    id: string;
    realItemId: string;
    paymentItemId: string;
    refundCount: number;
    itemName?: string;
    unitAmount?: number;
    unitAmountWithoutTax?: number;
    refundAmount?: number;
    refundAmountWithoutTax?: number;
    refundTaxAmount?: number;
    variation?: string;
}

export class RefundRequestDTO {
    id!: string;
    paymentId!: string;
    status: RefundRequestStatus = 'PENDING';
    items: RefundRequestItem[] = [];
    requestedByAccountId?: string;
    resolvedByAccountId?: string;
    createdAt?: Date;
    updatedAt?: Date;

    requestedByPaymentAccountId?: string;

    requestedToPaymentAccountId?: string;
    currency?: string;
}
