import {
    Entity,
    Column,
    PrimaryGeneratedColumn,
    OneToMany,
    ManyToOne,
    OneToOne,
} from 'typeorm';
import { PostralPaymentItem } from './payment-item.entity';
import { Payment } from './payment.entity';

@Entity()
export class PaymentProgress {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @Column()
    status: 'COMPLETED' | 'WAITING' | 'EXPIRED';

    @Column({ default: 0 })
    paidAmount: number;

    @Column()
    currency: string;

    @Column({ default: 0 })
    chargeBackAmountIc: number;

    @Column()
    paymentId: string;
}
