import { Column, Entity, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';
import { Payment } from './payment.entity';
import { MoneyDbField } from './base';
import Big = require('big.js');

@Entity()
export class PostralPaymentTax {
    @PrimaryGeneratedColumn('uuid')
    id!: string;

    @Column(MoneyDbField)
    taxAmount: number | Big = 0;

    @Column(MoneyDbField)
    untaxAmount: number | Big = 0;
    
    @Column(MoneyDbField)
    fullAmount: number | Big = 0;

    @Column(MoneyDbField)
    percent: number | Big = 0;

    @ManyToOne(() => Payment, (a) => a.items, {
        onDelete: 'CASCADE',
    })
    payment!: Payment;
}
