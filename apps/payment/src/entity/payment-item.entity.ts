import { Column, Entity, JoinColumn, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';
import { Payment } from './payment.entity';
import { MoneyDbField } from './base';
import { Account } from './account.entity';

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

     @Column(MoneyDbField)
    quantity: number = 0;

    @Column(MoneyDbField)
    totalAmount: number = 0;

    @Column(MoneyDbField)
    originalUnitAmount: number = 0;

    @Column(MoneyDbField)
    unitAmount: number = 0;

    @Column(MoneyDbField)
    taxPercent: number = 0;

    @Column(MoneyDbField)
    taxAmount: number = 0;

    @Column(MoneyDbField)
    unTaxAmount: number = 0;

    @ManyToOne(() => Payment, (a) => a.items, {
        onDelete: 'CASCADE',
    })
    payment!: Payment;

    @Column({ nullable: true })
    sellerAccountId?: string;

    @ManyToOne(() => Account, { eager: true, nullable: true })
    @JoinColumn({ name: 'sellerAccountId' })
    sellerAccount?: Account;

    get sellerAccountName(): string {
        return this.sellerAccount ? this.sellerAccount.name : '';
    }

    @Column()
    unit: string = "";

    @Column({ default: false })
    refunded: boolean = false;

    @Column(MoneyDbField)
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

    @Column(MoneyDbField)
    appComissionAmount: number = 0;

    @Column(MoneyDbField)
    appComissionPercent: number = 0;

    @Column(MoneyDbField)
    paymentServiceFeeAmount: number = 0;

    @Column(MoneyDbField)
    paymentServiceFeePercent: number = 0;

    @Column({ type: 'datetime', default: () => 'CURRENT_TIMESTAMP', onUpdate: 'CURRENT_TIMESTAMP' })
    updatedAt!: Date;

    @Column({ type: 'datetime', default: () => 'CURRENT_TIMESTAMP' })
    createdAt!: Date;

}
