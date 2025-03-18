import {
    Entity,
    Column,
    PrimaryGeneratedColumn,
    OneToMany,
    OneToOne,
} from 'typeorm';
import { PostralPaymentItem } from './payment-item.entity';
import { PaymentProgress } from './payment-status.entity';

@Entity()
export class Payment {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @Column()
    type: 'PURCHASE' | 'REFUND';

    @Column()
    totalAmount: number;

    /**
     * Euro (€ or EUR), US Dollars($ or USD), Turkish Lira (₺ or TRY), etc...
     */
    @Column()
    unit: string;

    @OneToMany(() => PostralPaymentItem, (item) => item.payment, {
        cascade: true,
    })
    items: PostralPaymentItem[];

    @OneToOne(() => PaymentProgress, (item) => item.payment, {
        cascade: true,
    })
    progress: PaymentProgress;
}
