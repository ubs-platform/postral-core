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


    createdAt: Date = new Date();

    updatedAt: Date = new Date();

}