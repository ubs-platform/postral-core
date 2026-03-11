export class RefundRequestItemDTO {
    paymentItemId: string;
    refundCount: number;
}

export class CreateRefundRequestDTO {
    paymentId: string;
    items: RefundRequestItemDTO[];
}

export class RefundRequestDTO {
    id: string;
    paymentId: string;
    status: 'PENDING' | 'APPROVED' | 'REJECTED';
    items: {
        id: string;
        paymentItemId: string;
        refundCount: number;
        itemName?: string;
        unitAmount?: number;
        unitAmountWithoutTax?: number;
        refundAmount?: number;
        refundAmountWithoutTax?: number;
        refundTaxAmount?: number;
        variation?: string;
    }[];
    requestedByAccountId: string;
    resolvedByAccountId?: string;
    createdAt: Date;
    updatedAt: Date;
}
