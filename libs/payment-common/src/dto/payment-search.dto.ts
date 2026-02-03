import { SearchRequest } from "@ubs-platform/crud-base-common";

export interface PaymentSearchDTO  {
    id?: string;
    type?: 'PURCHASE' | 'REFUND';
    customerAccountId?: string;
    sellerAccountIds?: string[];
    paymentChannelId?: string[];
    paymentStatus?: string[];
    currency?: string;
    dateFrom?: string;
    dateTo?: string;
}

export interface PaymentSearchPaginationDTO extends PaymentSearchDTO, SearchRequest {

}