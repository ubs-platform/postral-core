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
export class Transaction {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @Column()
    amount: number;

    @Column()
    currency: string;

    @Column()
    paymentChannelId: string

    @Column()
    paymentId: string;

    @Column()
    targetAccountId: string;

    @Column()
    sourceAccountId: string;

    @Column()
    status: 'INITIATED' | 'PENDING' | 'COMPLETED' | 'FAILED' | 'CANCELLED';

    @Column()
    approved: boolean
    // @Column()
    // type: 'PURCHASE' | 'REFUND';

    // @Column()
    // totalAmount: number;

    // @Column()
    // taxAmount: number;
    // /**
    //  * Euro (€ or EUR), US Dollars($ or USD), Turkish Lira (₺ or TRY), etc...
    //  */
    // @Column()
    // currency: string;

    // @OneToMany(() => PostralPaymentItem, (item) => item.payment, {
    //     cascade: true,
    // })
    // items: PostralPaymentItem[];

    // @OneToMany(() => PostralPaymentTax, (item) => item.payment, {
    //     cascade: true,
    // })
    // taxes: PostralPaymentTax[];

    // @OneToOne(() => PaymentProgress, (item) => item.payment, {
    //     cascade: true,
    // })
    // progress: PaymentProgress;
}
