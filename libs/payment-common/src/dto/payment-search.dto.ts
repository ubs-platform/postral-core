import { SearchRequest } from "@ubs-platform/crud-base-common";

export interface PaymentSearchFlatDTO  {
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
}

export interface PaymentSearchPaginationFlatDTO extends PaymentSearchFlatDTO, SearchRequest {

}