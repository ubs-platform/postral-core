import { Column, Entity, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';
import { Payment } from './payment.entity';
import { MoneyDbField } from './base';

@Entity()
export class PostralPaymentTax {
    @PrimaryGeneratedColumn('uuid')
    id!: string;

    @Column(MoneyDbField)
    taxAmount: number = 0;

    @Column(MoneyDbField)
    untaxAmount: number = 0;
    
    @Column(MoneyDbField)
    fullAmount: number = 0;

    @Column(MoneyDbField)
    percent: number = 0;

    @ManyToOne(() => Payment, (a) => a.items, {
        onDelete: 'CASCADE',
    })
    payment!: Payment;
}
