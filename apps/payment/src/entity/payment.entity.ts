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
export class Payment {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @Column({ length: 200, type: "varchar", nullable: true, unique: true })
    billingCode: string

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

}
