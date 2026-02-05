import {
    Entity,
    Column,
    PrimaryGeneratedColumn,
    OneToMany,
    OneToOne,
    Transaction,
} from 'typeorm';
import { PostralPaymentItem } from './payment-item.entity';
import { PostralPaymentTax } from './payment-tax.entity';
import {
    PaymentErrorStatus,
    PaymentStatus,
    TransactionType,
} from '@tk-postral/payment-common';

@Entity()
export class PaymentTransaction {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @Column({type: 'float'})
    amount: number;

    @Column({type: 'float'})
    taxAmount: number;

    @Column({type: 'float'})
    untaxedAmount: number;

    @Column()
    currency: string;

    @Column()
    paymentId: string;

    @Column()
    targetAccountId: string;

    @Column()
    sourceAccountId: string;

    @Column({ type: 'varchar' })
    paymentStatus: PaymentStatus;

    @Column({ type: 'varchar', nullable: true })
    errorStatus: PaymentErrorStatus;

    // faturalar için burası kullanılabilir
    // invoiceId: string;

    /**
     * 
     * Transaction 1 (A'nın bakiyesi için):
    * - sourceAccountId: A
    * - targetAccountId: B
    * - transactionType: DEBIT (A'dan para çıkışı)
    * - amount: 100

    * Transaction 2 (B'nin bakiyesi için):
    * - sourceAccountId: A
    * - targetAccountId: B
    * - transactionType: CREDIT (B'ye para girişi)
    * - amount: 100
     */
    @Column({ type: 'varchar' })
    transactionType: TransactionType;

    @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
    createdAt: Date;

    @Column({
        type: 'timestamp',
        default: () => 'CURRENT_TIMESTAMP',
        onUpdate: 'CURRENT_TIMESTAMP',
    })
    updatedAt: Date;

    @Column({
        type: 'timestamp',
        default: () => 'CURRENT_TIMESTAMP',
        onUpdate: 'CURRENT_TIMESTAMP',
    })
    lastOperationDate: Date;

    @Column({ type: 'mediumtext', nullable: true, default: '' })
    operationNote: string;

    @Column({ type: 'mediumtext', nullable: true, default: '' })
    description: string;
    // Additional fields can be added as needed
}
