/**
 * Harici platform (Hepsiburada, Trendyol vb.) üzerinden yapılan satışın Postral'a
 * kaydedilmesi için kullanılan girdi DTO'su. Para harici platformda tahsil edildiği
 * için kanal operasyonu çalışmaz; ödeme yalnızca komisyon/fatura/rapor için kaydedilir.
 */
import { AccountDTO } from './account.dto';
import { AccountAddressDto } from './address.dto';

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
     * Müşteri hesabı düz metin (şifrelenmemiş) DTO olarak alınır. Servis, hesabı önce
     * (externalPlatformId + externalPlatformAccountId) ile, yoksa kimlik alanlarıyla
     * (name + legalIdentity + type + phone) eşleştirir. Bulunamazsa oluşturur.
     * DTO alınmasının sebebi: PII alanları deterministik olarak şifreli tutulduğundan
     * eşleşme, DTO mapper üzerinden entity'ye çevrilip aynı temsile göre yapılır.
     */
    customerAccount: AccountDTO;

    /**
     * Faturalama adresi düz metin DTO. (externalPlatformId + externalPlatformAddressId)
     * ile, yoksa (cityName + district + streetName) ile eşleştirilir; bulunamazsa
     * oluşturulur ve çözülen adres müşteri hesabının defaultAddress'i yapılır.
     */
    billingAddress: AccountAddressDto;

    items: ExternalPlatformPaymentItemInputDTO[];
}
