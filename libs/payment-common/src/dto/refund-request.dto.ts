export type RefundRequestStatus = 'PENDING' | 'APPROVED' | 'REJECTED';

export type RefundReasonKey =
    | 'DAMAGED'
    | 'DEFECTIVE'
    | 'WRONG_ITEM'
    | 'MISSING_PARTS'
    | 'NOT_AS_DESCRIBED'
    | 'CHANGED_MIND'
    | 'OTHER';

export const REFUND_REASON_KEYS: RefundReasonKey[] = [
    'DAMAGED',
    'DEFECTIVE',
    'WRONG_ITEM',
    'MISSING_PARTS',
    'NOT_AS_DESCRIBED',
    'CHANGED_MIND',
    'OTHER',
];


export class RefundRequestItemDTO {
    paymentItemId: string;
    refundCount: number;
}

export class CreateRefundRequestDTO {
    paymentId: string;
    items: RefundRequestItemDTO[];
    reasonKeys: RefundReasonKey[];
    requestNote?: string;
}

export class ResolveRefundRequestDTO {
    resolutionNote?: string;
}

export class RefundRequestDTO {
    id: string;
    paymentId: string;
    status: 'PENDING' | 'APPROVED' | 'REJECTED';
    items: {
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
    }[];
    requestedByAccountId?: string;
    resolvedByAccountId?: string;
    createdAt?: Date;
    updatedAt?: Date;
    /**
 * Payment Account Id. Bu, refund request'i kimin oluşturduğunu takip etmek için kullanılabilir. 
 * Ancak, bu sadece bir referans ve gerçek account bilgisi için Payment Account servisine sorgu atılması gerekebilir.
 */
    requestedByPaymentAccountId?: string;

    /**
 * Payment Account Id. Bu, refund request'i kimin çözdüğünü takip etmek için kullanılabilir. Ancak, bu sadece bir referans ve gerçek account bilgisi için Payment Account servisine sorgu atılması gerekebilir.
 */
    requestedToPaymentAccountId?: string;
    currency?: string;
    reasonKeys?: RefundReasonKey[];
    requestNote?: string;
    resolutionNote?: string;
}
