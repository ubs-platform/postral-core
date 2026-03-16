import {
    Entity,
    Column,
    PrimaryGeneratedColumn,
    OneToMany,
    OneToOne,
    ManyToOne,
    JoinColumn,
} from 'typeorm';
import { PostralPaymentItem } from './payment-item.entity';
import { PostralPaymentTax } from './payment-tax.entity';
import { PaymentErrorStatus, PaymentStatus } from '@tk-postral/payment-common';
import { RefundRequest } from './refund-request.entity';

@Entity()
export class Payment {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @Column({ length: 200, type: 'varchar', nullable: true, unique: true })
    billingCode: string;

    @Column()
    type: 'PURCHASE' | 'REFUND';

    @Column({ type: 'float' })
    totalAmount: number;

    @Column({ type: 'float' })
    taxAmount: number;
    /**
     * Euro (€ or EUR), US Dollars($ or USD), Turkish Lira (₺ or TRY), etc...
     */
    @Column()
    currency: string;

    @OneToMany(() => PostralPaymentItem, (item) => item.payment, {
        cascade: true,
    })
    items: PostralPaymentItem[];

    @OneToMany(() => PostralPaymentTax, (item) => item.payment, {
        cascade: true,
    })
    taxes: PostralPaymentTax[];

    @Column()
    customerAccountId: string;

    @Column({ nullable: true })
    customerAccountName: string;

    @Column({ type: 'varchar' })
    paymentStatus: PaymentStatus;

    @Column({ type: 'varchar', nullable: true })
    errorStatus: PaymentErrorStatus;

    /**
     * Nakit, Kredi Kartı, Havale/EFT, vs...
     */
    @Column({ nullable: true })
    paymentChannelId: string;

    @Column({ nullable: true })
    paymentChannelOperationId: string;

    @Column({ nullable: true })
    paymentChannelOperationUrl: string;

    @Column({ nullable: true })
    channelUrlExpiryDate: Date;

    @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
    createdAt: Date;

    @Column({
        type: 'timestamp',
        default: () => 'CURRENT_TIMESTAMP',
        onUpdate: 'CURRENT_TIMESTAMP',
    })
    updatedAt: Date;

    @OneToMany(() => PostralPaymentItem, (item) => item.refundPayment, {
        cascade: true,
    })
    refundItems: PostralPaymentItem[];

    @OneToOne(() => RefundRequest, (refundRequest) => refundRequest.payment, { nullable: true, cascade: false, eager: false })
    @JoinColumn({ name: "refundRequestId" })
    refundRequest: RefundRequest;

    @Column({ nullable: true })
    refundRequestId?: string;


}
