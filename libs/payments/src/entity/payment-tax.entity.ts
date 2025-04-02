import { Column, Entity, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';
import { Payment } from './payment.entity';

@Entity()
export class PostralPaymentTax {
    @PrimaryGeneratedColumn('uuid')
    id: string;
    @Column()
    quantity: number;
    @Column()
    totalAmount: number;
    @Column()
    unitAmount: number;
    @Column()
    taxPercent: number;

    @ManyToOne(() => Payment, (a) => a.items, {
        onDelete: 'CASCADE',
    })
    payment: Payment;
}
