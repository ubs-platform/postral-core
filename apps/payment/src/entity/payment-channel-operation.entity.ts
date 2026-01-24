import { Column, Entity, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';
import { Payment } from './payment.entity';
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

    // @Column()
    // operationType: string;

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

    // @ManyToOne(() => Payment, (payment) => payment.channelOperations, {
    //     onDelete: 'CASCADE',
    // })
    // payment: Payment;
}
