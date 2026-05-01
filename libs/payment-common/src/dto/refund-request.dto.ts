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
}
