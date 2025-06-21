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
import { ItemPriceDefaults, ItemPriceDTO } from '@tk-postral/payment-common';
@Entity()
export class ItemPrice {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @Column()
    itemId: string;

    @Column({ default: ItemPriceDefaults.VARIATION_DEFAULT })
    variation: string;

    @Column({ default: 0, type: 'bigint' })
    itemPrice: number;

    @Column({ default: 0, type: 'bigint' })
    taxPercent: number;

    @Column({ default: ItemPriceDefaults.REGION_ANY })
    region: string;
    
    @Column()
    currency: string;

    /* 0 default fiyatıdır, activityOrder en yüksek olan tercih edilir. Kampanya gibi durumlarda bu artırılarak önceliği yükselir ve bu fiyattan verilir */
    @Column({ default: 0, type: "bigint" })
    activityOrder: number;

    @Column({ nullable: true, type: 'datetime' })
    activeStartAt?: Date;

    /**Null ise sonsuza kadardır */
    @Column({ nullable: true, type: 'datetime' })
    activeExpireAt?: Date;
}
