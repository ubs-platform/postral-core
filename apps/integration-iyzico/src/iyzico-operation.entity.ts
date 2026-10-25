import { Column, Entity, PrimaryColumn } from 'typeorm';
import type { PaymentOperationStatus } from '@tk-postral/payment-common';

export interface IyzicoBasketLine {
    paymentItemId: string;
    price: string;
}

export interface IyzicoItemTransaction {
    paymentItemId: string;
    paymentTransactionId: string;
    price: string;
    paidPrice: string;
}

@Entity('iyzico_operation')
export class IyzicoOperation {
    @PrimaryColumn('uuid')
    id!: string;

    @Column({ unique: true })
    paymentId!: string;

    @Column()
    currency!: string;

    @Column({ type: 'decimal', precision: 19, scale: 2 })
    amount!: string;

    @Column({ type: 'varchar', default: 'WAITING' })
    status!: PaymentOperationStatus;

    @Column({ type: 'varchar', default: 'INITIALIZING' })
    initializationState!:
        'INITIALIZING' | 'INITIALIZED' | 'RECONCILIATION_REQUIRED';

    @Column({ type: 'varchar', length: 512, nullable: true })
    token!: string | null;

    @Column({ type: 'text', nullable: true })
    paymentPageUrl!: string | null;

    @Column({ type: 'varchar', nullable: true })
    providerPaymentId!: string | null;

    @Column({ type: 'decimal', precision: 19, scale: 4, nullable: true })
    providerFee!: string | null;

    @Column({ type: 'json' })
    basketLines!: IyzicoBasketLine[];

    @Column({ type: 'json', nullable: true })
    itemTransactions!: IyzicoItemTransaction[] | null;

    @Column({ type: 'text', nullable: true })
    returnUrl!: string | null;

    @Column({ default: false })
    callbackReceived!: boolean;

    @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
    createdAt!: Date;
}
