import {
    Entity,
    Column,
    PrimaryGeneratedColumn,
    OneToMany,
    OneToOne,
} from 'typeorm';
import { PostralPaymentItem } from './payment-item.entity';
import { PaymentProgress } from './payment-status.entity';
import { PostralPaymentTax } from './payment-tax.entity';

@Entity()
export class ItemPrice {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @Column()
    itemId: string;

    @Column({ default: '' })
    variation: string;

    @Column({ default: 0, type: 'long' })
    itemPrice: number;

    @Column()
    itemPriceUnit: string;

    // /** Kur dönüşümü joblarında buna referans alınarak dönüşüm yapılacak. */
    // @Column()
    // defaultPriceUnit: string;

    /* 0 default fiyatıdır, activityOrder en yüksek olan tercih edilir. Kampanya gibi durumlarda bu artırılarak önceliği yükselir ve bu fiyattan verilir */
    @Column({ default: 0, type: 'long' })
    activityOrder: number;
}
