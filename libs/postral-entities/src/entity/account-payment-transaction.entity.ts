import { PaymentStatus } from '@tk-postral/payment-common';
import {
    Column,
    Entity,
    JoinColumn,
    ManyToOne,
    OneToMany,
    PrimaryGeneratedColumn,
} from 'typeorm';
import { MoneyDbField } from './base';

@Entity()
export class AccountPaymentTransaction {
    @PrimaryGeneratedColumn('uuid')
    id!: string;

    @Column()
    corelationId!: string;

    // uuid
    @Column()
    accountId!: string;

    @Column()
    accountName!: string;

    @Column()
    paymentId!: string;

    @Column({ nullable: true })
    paymentSellerOrderId?: string;

    @Column()
    type!: "DEBIT" | "CREDIT";

    @Column({ type: "varchar", length: 20 })
    status!: PaymentStatus;

    @Column(MoneyDbField)
    amount: number = 0;

    @Column(MoneyDbField)
    taxAmount: number = 0;

    @Column({ type: "datetime", default: () => "CURRENT_TIMESTAMP" })
    creationDate: Date = new Date();

    @Column({ type: "datetime", default: () => "CURRENT_TIMESTAMP", onUpdate: "CURRENT_TIMESTAMP" })
    updateDate: Date = new Date();


    @Column({ type: 'mediumtext', nullable: true, default: '' })
    operationNote: string = "";

    @Column({ type: 'mediumtext', nullable: true, default: '' })
    description: string = "";
}