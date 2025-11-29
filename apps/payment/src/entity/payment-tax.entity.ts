import { Column, Entity, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';
import { Payment } from './payment.entity';

@Entity()
export class PostralPaymentTax {
    @PrimaryGeneratedColumn('uuid')
    id: string;
    @Column({ type: 'float' })
    taxAmount: number;
    @Column({ type: 'float' })
    untaxAmount: number;
    @Column({ type: 'float' })
    fullAmount: number;
    @Column({ type: 'float' })
    percent: number;

    @ManyToOne(() => Payment, (a) => a.items, {
        onDelete: 'CASCADE',
    })
    payment: Payment;
}
