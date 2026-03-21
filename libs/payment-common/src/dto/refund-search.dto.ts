import { SearchRequest } from "@ubs-platform/crud-base-common";

export class RefundRequestSearchDTO implements SearchRequest {
    page: number;
    size: number;
    sortBy?: string | undefined;
    sortRotation?: "desc" | "asc" | undefined;
    status?: 'PENDING' | 'APPROVED' | 'REJECTED';
    paymentId?: string;
    sellerAccountId?: string;
    mode: "ADMIN" | "USER";
}
