import { Column, Entity, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';
import { Payment } from './payment.entity';

@Entity()
export class PostralPaymentItem {
    @PrimaryGeneratedColumn('uuid')
    id!: string;

    @Column()
    itemId: string = "";

    @Column()
    entityGroup?: string;

    @Column()
    entityName?: string;

    @Column()
    entityId?: string;

    @Column()
    variation!: string;

    @Column()
    name!: string;

    @Column({ type: 'float' })
    quantity: number = 0;

    @Column({ type: 'float' })
    totalAmount: number = 0;

    @Column({ type: 'float' })
    originalUnitAmount: number = 0;

    @Column({ type: 'float' })
    unitAmount: number = 0;

    @Column({ type: 'float' })
    taxPercent: number = 0;

    @Column({ type: 'float' })
    taxAmount: number = 0;

    @Column({ type: 'float' })
    unTaxAmount: number = 0;

    @ManyToOne(() => Payment, (a) => a.items, {
        onDelete: 'CASCADE',
    })
    payment!: Payment;

    @Column()
    sellerAccountId: string = "";

    @Column()
    sellerAccountName: string = "";

    @Column()
    unit: string = "";

    @Column({ default: false })
    refunded: boolean = false;

    @Column({ type: 'float', default: 0 })
    refundCount: number = 0;

    @Column({ nullable: true })
    refundPaymentId?: string;

    @Column({ nullable: true, type: 'timestamp' })
    refundDate?: Date;

    @ManyToOne(() => Payment, (a) => a.refundItems, {
        onDelete: 'CASCADE',
    })
    refundPayment?: Payment;

    @Column()
    itemClass: string = "";

    @Column({ type: 'float' })
    appComissionAmount: number = 0;

    @Column({ type: 'float' })
    appComissionPercent: number = 0;

    @Column({ type: 'float' })
    paymentServiceFeeAmount: number = 0;

    @Column({ type: 'float' })
    paymentServiceFeePercent: number = 0;

    @Column({ type: 'datetime', default: () => 'CURRENT_TIMESTAMP', onUpdate: 'CURRENT_TIMESTAMP' })
    updatedAt!: Date;

    @Column({ type: 'datetime', default: () => 'CURRENT_TIMESTAMP' })
    createdAt!: Date;
}
