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

    description?: string | null;

    createdAt?: Date;
    updatedAt?: Date;
}
