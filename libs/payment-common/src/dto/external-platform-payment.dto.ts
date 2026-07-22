/**
 * Harici platform (Hepsiburada, Trendyol vb.) üzerinden yapılan satışın Postral'a
 * kaydedilmesi için kullanılan girdi DTO'su. Para harici platformda tahsil edildiği
 * için kanal operasyonu çalışmaz; ödeme yalnızca komisyon/fatura/rapor için kaydedilir.
 */
export interface ExternalPlatformPaymentItemInputDTO {
    // Postral ürün kimliği (opsiyonel — harici katalog farklı olabilir)
    itemId?: string;

    name: string;

    quantity: number;

    // Vergiler dahil birim fiyat
    unitAmount: number;

    // 100 üzerinden yüzde olarak vergi oranı
    taxRate: number;

    sellerAccountId: string;

    itemClass?: string;

    variation?: string;

    unit?: string;
}

export interface CreateExternalPlatformPaymentDTO {
    externalPlatformId: string;

    externalPlatformOrderId: string;

    /**
     * Euro (€ or EUR), US Dollars($ or USD), Turkish Lira (₺ or TRY), etc...
     */
    currency: string;

    /**
     * Bizim sistemde eğer müşteri yoksa yeni oluşturulup kaydedilebilir,
     * Belki bilgileri ve adresi buradan alınabilir. Ama şimdilik sadece id ile eşleşen müşteri hesabı kullanılacak.
     * Bu yüzden müşteri hesabı id'si zorunlu tutuluyor.
     * Eğer müşteri hesabı yoksa, önce müşteri hesabı oluşturulup id'si buraya verilebilir.
     * (Müşteri hesabı oluşturma işlemi Postral API'de mevcut)
     * 
     * NOT: Müşteri hesabı oluşturma işlemi Postral API'de mevcut. Eğer müşteri hesabı yoksa, önce müşteri hesabı oluşturulup id'si buraya verilebilir.
     * (Müşteri hesabı oluşturma işlemi Postral API'de mevcut)
     * 
     * NOT: Müşteri hesabı oluşturma işlemi Postral API'de mevcut. Eğer müşteri hesabı yoksa, önce müşteri hesabı oluşturulup id'si buraya verilebilir.
     * (Müşteri hesabı oluşturma işlemi Postral API'de mevcut)
     * 
     */
    customerAccountId: string;

    items: ExternalPlatformPaymentItemInputDTO[];
}
