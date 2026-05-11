import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity()
export class PaymentChannelConfig {
    @PrimaryGeneratedColumn('uuid')
    id!: string;

    /** Kafka topic segmenti — ör. 'dummy-ecommerce'. postral/payment-channel/{channelId}/init gibi pattern'lerde kullanılır. */
    @Column({ type: 'varchar', unique: true })
    channelId: string = '';

    /** Kullanıcıya gösterilen okunabilir kanal adı */
    @Column({ type: 'varchar' })
    name: string = '';

    /** Kanal aktif mi? false ise ödeme sırasında seçilemez. */
    @Column({ type: 'boolean', default: true })
    enabled: boolean = true;

    /** true ise bu kanal sadece dev ortamında görünür, production'da _search'den filtrelenir. */
    @Column({ type: 'boolean', default: false })
    devOnly: boolean = false;

    @Column({ type: 'varchar', nullable: true })
    description: string | null = null;

    @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
    createdAt: Date = new Date();

    @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP', onUpdate: 'CURRENT_TIMESTAMP' })
    updatedAt: Date = new Date();
}
