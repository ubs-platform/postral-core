import { Column, Entity, PrimaryColumn } from 'typeorm';
import { PaymentOperationStatus } from '@tk-postral/payment-common';

@Entity()
export class DummyEcommerceOperation {
    /** Ödeme operasyon ID'si (postral tarafından üretilen UUID) */
    @PrimaryColumn({ type: 'varchar' })
    operationId!: string;

    @Column({ type: 'varchar', nullable: true })
    status: PaymentOperationStatus = 'WAITING';

    @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
    createdAt: Date = new Date();

    @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP', onUpdate: 'CURRENT_TIMESTAMP' })
    updatedAt: Date = new Date();
}
