import {
    Entity,
    Column,
    PrimaryGeneratedColumn,
    OneToMany,
    OneToOne,
    Transaction,
    ManyToOne,
    JoinColumn,
    BaseEntity,
    Unique,
} from 'typeorm';
import { PostralPaymentItem } from './payment-item.entity';
import { PostralPaymentTax } from './payment-tax.entity';
import {
    PaymentErrorStatus,
    PaymentStatus,
    SellerPaymentOrderType,
} from '@tk-postral/payment-common';
import { Account } from './account.entity';
import { MoneyDbField } from './base';

@Entity()
@Unique(['paymentId', "targetAccountId"])
export class SellerPaymentOrder extends BaseEntity {
    @PrimaryGeneratedColumn('uuid')
    id!: string;

    @Column(MoneyDbField)
    amount: number = 0;

    @Column(MoneyDbField)
    taxAmount: number = 0;

    @Column(MoneyDbField)
    untaxedAmount: number = 0;

    @Column()
    currency!: string;

    @Column()
    paymentId!: string;

    // @ManyToOne(() => Payment)
    // @JoinColumn({ name: 'paymentId' })
    // payment: Payment;

    @Column()
    targetAccountId!: string;

    @ManyToOne(() => Account, { eager: true })
    @JoinColumn({ name: 'targetAccountId' })
    targetAccount?: Account;

    @Column()
    sourceAccountId!: string;

    @ManyToOne(() => Account, { eager: true })
    @JoinColumn({ name: 'sourceAccountId' })
    sourceAccount?: Account;

    @Column({ type: 'varchar' })
    paymentStatus!: PaymentStatus;

    @Column({ type: 'varchar', nullable: true })
    errorStatus?: PaymentErrorStatus;

    @Column({ type: 'int', default: 0 })
    invoiceCount: number = 0;

    @Column({ type: 'boolean', default: false })
    hasFinalizedInvoice: boolean = false;

    // faturalar için burası kullanılabilir
    // invoiceId: string;

    /**
     * 
     * Transaction 1 (A'nın bakiyesi için):
    * - sourceAccountId: A
    * - targetAccountId: B
    * - transactionType: DEBIT_FROM_SELLER (A'dan para çıkışı)
    * - amount: 100

    * Transaction 2 (B'nin bakiyesi için):
    * - sourceAccountId: A
    * - targetAccountId: B
    * - transactionType: CREDIT_TO_SELLER (B'ye para girişi)
    * - amount: 100
     */
    @Column({ type: 'varchar' })
    sellerOrderType!: SellerPaymentOrderType;

    @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
    createdAt: Date = new Date();

    @Column({
        type: 'timestamp',
        default: () => 'CURRENT_TIMESTAMP',
        onUpdate: 'CURRENT_TIMESTAMP',
    })
    updatedAt: Date = new Date();

    @Column({
        type: 'timestamp',
        default: () => 'CURRENT_TIMESTAMP',
        onUpdate: 'CURRENT_TIMESTAMP',
    })
    lastOperationDate: Date = new Date();

    @Column({ type: 'mediumtext', nullable: true, default: '' })
    operationNote: string = '';

    @Column({ type: 'mediumtext', nullable: true, default: '' })
    description: string = '';

    // Additional fields can be added as needed
}
