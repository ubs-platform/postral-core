import {
    Entity,
    Column,
    PrimaryGeneratedColumn,
    ManyToOne,
    JoinColumn,
    CreateDateColumn,
    UpdateDateColumn,
} from 'typeorm';
import { Payment } from './payment.entity';
import { PaymentTransaction } from './transaction.entity';

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

    /**
     * Fatura dosya yolu
     */
    @Column({ length: 500 })
    filePath: string;

    /**
     * Orijinal dosya adı
     */
    @Column({ length: 255 })
    originalFileName: string;

    /**
     * Dosya boyutu (bytes)
     */
    @Column({ type: 'int' })
    fileSize: number;

    /**
     * MIME type (application/pdf, image/jpeg, vb.)
     */
    @Column({ length: 100 })
    mimeType: string;

    /**
     * Fatura numarası (opsiyonel)
     */
    @Column({ length: 100, nullable: true })
    invoiceNumber: string;

    /**
     * Fatura tarihi
     */
    @Column({ type: 'date', nullable: true })
    invoiceDate: Date;

    /**
     * Fatura durumu: UPLOADED, VERIFIED, REJECTED, vb.
     */
    @Column({ default: 'UPLOADED' })
    status: string;

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

    @CreateDateColumn()
    createdAt: Date;

    @UpdateDateColumn()
    updatedAt: Date;
}
