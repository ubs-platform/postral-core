import { Column, Entity, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';
import {
    PaymentOperationStatus,
    PaymentStatus,
} from '@tk-postral/payment-common';

@Entity()
export class PaymentChannelOperation {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @Column()
    paymentChannelId: string;

    @Column({ type: 'varchar', nullable: true })
    operationId: string;

    @Column({ type: 'varchar', nullable: true })
    redirectUrl: string;

    @Column({ type: 'float' })
    amount: number;

    @Column()
    currency: string;

    @Column({ type: 'varchar', nullable: true })
    status: PaymentOperationStatus;

    @Column({ type: 'varchar', nullable: true })
    paymentId: string;

    @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
    createdAt: Date;

    @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP', onUpdate: 'CURRENT_TIMESTAMP' })
    updatedAt: Date;
}
