import { ItemTaxDTO } from "./item-tax.dto";

export class AdminSettingsDto {
    id!: string;

    /**
     * Ödeme altyapısı ücretlerini satıcıya yansıtır. İğrenç bir özellik ama isteyenler olabilir...
     * TODO: Özellik implement edilecek
     * 
     */
    sellerPaysPaymentServiceFee: boolean = false;

    /**
     * Eğer true ise net gelir üzerinden komisyon hesaplanır, false ise brüt gelir üzerinden hesaplanır. 
     * TODO: Özellik implement edilecek
     */
    comissionsCalculatedFromNet: boolean = false;

    // Komisyonların hangi raporlama sorgusuna göre hesaplanacağını belirler.
    //  Admin tarafından seçilecek. 
    // Seçilen raporlama sorgusu, rapor digestion tarafından kullanılacak ve rapor digestion,
    comissionItemTaxId?: string;

    // Komisyonlarda kullanılacak vergi oranı. Admin tarafından seçilecek. Seçilen vergi oranı, ürünlerde kullanılan tax entitysi içerisinden seçilecek.

    // Faturalandırma için platformun kendi hesap ID'si.
    billingAccountId?: string;

    // Fatura kesim günleri (ayın kaçında). Örnek: [1, 15]
    billingDays?: number[];

    createdAt: Date = new Date();

    updatedAt: Date = new Date();
    comissionItemTax?: ItemTaxDTO;

}