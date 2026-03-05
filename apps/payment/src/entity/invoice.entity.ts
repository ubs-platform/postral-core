import {
    Entity,
    Column,
    PrimaryGeneratedColumn,
    ManyToOne,
    JoinColumn,
    CreateDateColumn,
    UpdateDateColumn,
    OneToOne,
} from 'typeorm';
import { Payment } from './payment.entity';
import { PaymentTransaction } from './transaction.entity';
import { InvoiceAddress } from './invoice-address.entity';
import { InvoiceAccount } from './invoice-account.entity';

@Entity()
export class Invoice {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @Column({ nullable: true })
    paymentId: string;

    @ManyToOne(() => Payment, { nullable: true, eager: false })
    @JoinColumn({ name: 'paymentId' })
    payment: Payment;

    @Column({ nullable: true })
    transactionId: string;

    @ManyToOne(() => PaymentTransaction, { nullable: true, eager: false })
    @JoinColumn({ name: 'transactionId' })
    transaction: PaymentTransaction;

    @OneToOne(() => InvoiceAddress, { cascade: true, eager: true })
    @JoinColumn()
    customerInvoiceAddress?: InvoiceAddress;

    @OneToOne(() => InvoiceAccount, { cascade: true, eager: true })
    @JoinColumn()
    customerAccount?: InvoiceAccount;

    @OneToOne(() => InvoiceAccount, { cascade: true, eager: true })
    @JoinColumn()
    sellerInvoiceAccount?: InvoiceAccount;

    @OneToOne(() => InvoiceAddress, { cascade: true, eager: true })
    @JoinColumn()
    sellerInvoiceAddress?: InvoiceAddress;

    // Dosyayı file servisi ile tutabilirim o nedenle sadece müşteri bilgilerini tutuyorum

    @Column({ length: 100, nullable: true })
    invoiceNumber: string;

    /**
     * Fatura tarihi
     */
    @Column({ type: 'date', nullable: true })
    invoiceDate: Date;

    // Zaten finalized olan onaylanmıştır. Onaylanmamış olanlar ise sadece yüklenmiş durumdadır. Onaylanmamış faturaların tekrar onaylanması veya reddedilmesi mümkün değildir.
    /**
     * Fatura durumu: UPLOADED, VERIFIED, REJECTED, vb.
     * 
     */
    // @Column({ default: 'UPLOADED' })
    // status: "IDLE" | "UPLOADED" | "VERIFIED" | "REJECTED";

    /**
     * Faturayı yükleyen kullanıcı ID
     */
    @Column({ nullable: true })
    uploadedByUserId: string;

    /**
     * Ek notlar
     */
    @Column({ type: 'text', nullable: true })
    notes: string;

    @Column({ type: "bool", default: false })
    finalized: boolean;

    @CreateDateColumn()
    createdAt: Date;

    @UpdateDateColumn()
    updatedAt: Date;
}
