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
    name: string;

    @Column({type: 'float'})
    quantity: number;

    @Column({type: 'float'})
    totalAmount: number;

    @Column({type: 'float'})
    originalUnitAmount: number;

    @Column({type: 'float'})
    unitAmount: number;

    @Column({type: 'float'})
    taxPercent: number;

    @Column({type: 'float'})
    taxAmount: number;

    @Column({type: 'float'})
    unTaxAmount: number;

    @ManyToOne(() => Payment, (a) => a.items, {
        onDelete: 'CASCADE',
    })
    payment: Payment;
    
    @Column()
    sellerAccountId: string;

    @Column()
    sellerAccountName: string;

    @Column()
    unit: string;

    @Column({ default: false })
    refunded: boolean;

    @Column({ type: 'float', default: 0 })
    refundCount: number;

    @Column({ nullable: true })
    refundPaymentId?: string;

    @Column({ nullable: true, type: 'timestamp' })
    refundDate?: Date;

    @ManyToOne(() => Payment, (a) => a.refundItems, {
        onDelete: 'CASCADE',
    })
    refundPayment: Payment;
}
