import { Column, Entity, Index, PrimaryColumn } from 'typeorm';
import type { RefundChannelLine } from '@tk-postral/payment-common';
import type { RefundRoundingMode } from './refund-rounding.util';

export interface IyzicoRefundLine extends RefundChannelLine {
    paymentTransactionId: string;
    conversationId: string;
    state: 'RESERVED' | 'SUBMITTING' | 'SUCCEEDED' | 'REJECTED' | 'RECONCILIATION_REQUIRED';
    refundHostReference?: string;
    errorCode?: string;
}

@Entity('iyzico_refund')
@Index(['originalOperationId'])
export class IyzicoRefund {
    @PrimaryColumn('uuid')
    id!: string;

    @Column({ unique: true })
    paymentId!: string;

    @Column()
    originalOperationId!: string;

    @Column()
    currency!: string;

    @Column({ type: 'varchar' })
    roundingMode!: RefundRoundingMode;

    @Column({ type: 'varchar', default: 'RESERVED' })
    state!: 'RESERVED' | 'SUBMITTING' | 'FINISHED' | 'RECONCILIATION_REQUIRED';

    @Column({ type: 'json' })
    lines!: IyzicoRefundLine[];

    @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
    createdAt!: Date;
}
