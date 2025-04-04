import { Column, Entity, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';
import { Payment } from './payment.entity';

@Entity()
export class PostralPaymentTax {
    @PrimaryGeneratedColumn('uuid')
    id: string;
    @Column()
    taxAmount: number;
    @Column()
    untaxAmount: number;
    @Column()
    fullAmount: number;
    @Column()
    percent: number;

    @ManyToOne(() => Payment, (a) => a.items, {
        onDelete: 'CASCADE',
    })
    payment: Payment;
}
