import {
    Entity,
    Column,
    PrimaryGeneratedColumn,
    OneToMany,
    OneToOne,
} from 'typeorm';
import { PostralPaymentItem } from './payment-item.entity';
import { PostralPaymentTax } from './payment-tax.entity';

@Entity()
export class Payment {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @Column({ length: 200, type: 'varchar', nullable: true, unique: true })
    billingCode: string;

    @Column()
    type: 'PURCHASE' | 'REFUND';

    @Column()
    totalAmount: number;

    @Column()
    taxAmount: number;
    /**
     * Euro (€ or EUR), US Dollars($ or USD), Turkish Lira (₺ or TRY), etc...
     */
    @Column()
    currency: string;

    @OneToMany(() => PostralPaymentItem, (item) => item.payment, {
        cascade: true,
    })
    items: PostralPaymentItem[];

    @OneToMany(() => PostralPaymentTax, (item) => item.payment, {
        cascade: true,
    })
    taxes: PostralPaymentTax[];

    @Column()
    customerAccountId: string;

    /**
     * INITIATED: Payment oluşturuldu, ancak henüz ödeme kanalı ile işlem başlatılmadı.
     * WAITING: Ödeme kanalı ile işlem başlatıldı, ancak ödeme henüz tamamlanmadı.
     * COMPLETED: Ödeme başarıyla tamamlandı.
     * EXPIRED: Ödeme işlemi süresi doldu veya iptal edildi.
     */
    @Column()
    status: 'INITIATED' | 'WAITING' | 'COMPLETED' | 'EXPIRED';

    /**
     * Nakit, Kredi Kartı, Havale/EFT, vs...
     */
    @Column({nullable: true})
    paymentChannelId: string;

    @Column({nullable: true})
    paymentChannelOperationId: string;

    @Column({nullable: true})
    paymentChannelOperationUrl: string;

    @Column({nullable: true})
    channelUrlExpiryDate: Date;

    @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
    createdAt: Date;

    @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' , onUpdate: "CURRENT_TIMESTAMP"})
    updatedAt: Date;
}
