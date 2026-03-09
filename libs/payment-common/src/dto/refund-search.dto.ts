export class RefundRequestSearchDTO {
    status?: 'PENDING' | 'APPROVED' | 'REJECTED';
    paymentId?: string;
    sellerAccountId?: string;
    
    // Pagination
    page?: number;
    limit?: number;
}
