import { SearchRequest } from "@ubs-platform/crud-base-common";

export class PaymentSearchFlatDTO  {
    id?: string;
    type?: 'PURCHASE' | 'REFUND';
    // Çoklu arama yapabilir, virgülle ayrılmış şekilde gönderilir. Örnek: "id1,id2,id3"
    customerAccountId?: string;
    // Çoklu arama yapabilir, virgülle ayrılmış şekilde gönderilir. Örnek: "id1,id2,id3"
    sellerAccountIds?: string;
    // Çoklu arama yapabilir, virgülle ayrılmış şekilde gönderilir. Örnek: "id1,id2,id3"
    paymentChannelIds?: string;
    // Çoklu arama yapabilir, virgülle ayrılmış şekilde gönderilir. Örnek: "id1,id2,id3"
    paymentStatus?: string;
    currency?: string;
    dateFrom?: string;
    dateTo?: string;
    // admin?: 'true' | 'false';
    /**
     * Satıcı Tarafından Arama Yapılıyor ise 'USER', Müşteri Tarafından Arama Yapılıyor ise 'USER' değeri gönderilmelidir.
     * Bu alan, kullanıcının yetkilerine göre arama sonuçlarını filtrelemek için kullanılır.
     * Örneğin, bir satıcı kendi hesaplarına ait ödemeleri görmelidir, müşteri ise sadece kendi yaptığı ödemeleri görmelidir.
     */
    searchSide?: 'USER' | "ADMIN";
    activeSessionId?: string;
}

export class PaymentSearchPaginationFlatDTO implements PaymentSearchFlatDTO, SearchRequest {
    page!: number;
    size!: number;
    sortBy?: string | undefined;
    sortRotation?: "asc" | "desc" | undefined;
    id?: string | undefined;
    type?: "PURCHASE" | "REFUND" | undefined;
    customerAccountId?: string | undefined;
    sellerAccountIds?: string | undefined;
    paymentChannelIds?: string | undefined;
    paymentStatus?: string | undefined;
    currency?: string | undefined;
    dateFrom?: string | undefined;
    dateTo?: string | undefined;
    searchSide?: "USER" | "ADMIN" | undefined;
    activeSessionId?: string | undefined;

}