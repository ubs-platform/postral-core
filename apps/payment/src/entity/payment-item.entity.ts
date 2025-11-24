import { Column, Entity, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';
import { Payment } from './payment.entity';

@Entity()
export class PostralPaymentItem {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @Column()
    itemId: string;

    @Column()
    entityGroup: string;

    @Column()
    entityName: string;

    @Column()
    entityId: string;

    @Column()
    variation: string;

    @Column()
    entityOwnerAccountId: string;

    @Column()
    name: string;

    @Column()
    quantity: number;

    @Column()
    totalAmount: number;

    @Column()
    originalUnitAmount: number;

    @Column()
    unitAmount: number;

    @Column()
    taxPercent: number;

    @Column()
    taxAmount: number;

    @Column()
    unTaxAmount: number;

    @ManyToOne(() => Payment, (a) => a.items, {
        onDelete: 'CASCADE',
    })
    payment: Payment;
    
    @Column()
    sellerAccountId: string;
}
