export class PaymentChannelConfigDTO {
    id?: string;

    /** Kafka topic segmenti — ör. 'dummy-ecommerce' */
    channelId: string = '';

    /** Ödeme ekranında gösterilen okunabilir kanal adı */
    name: string = '';

    /** Kanal aktif mi? */
    enabled: boolean = true;

    /** true ise bu kanal sadece dev ortamında görünür */
    devOnly: boolean = false;

    /** Eğer bu kanalda bir işlem devam ediyorsa başka işleme izin verilip verilmemesini ayarlar. 
     * Eğer ödeme kanalı yeni bir id üretiyorsa, bu kapalı kalması önemlidir. 
     * Aksi halde müşteriler birden fazla kez kesinti yapılabilir.
     *   */
    allowMultipleOperations: boolean = false;

    description?: string | null;

    createdAt?: Date;
    updatedAt?: Date;
}
