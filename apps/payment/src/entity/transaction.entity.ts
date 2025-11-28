import {
    Entity,
    Column,
    PrimaryGeneratedColumn,
    OneToMany,
    OneToOne,
} from 'typeorm';
import { PostralPaymentItem } from './payment-item.entity';
import { PostralPaymentTax } from './payment-tax.entity';

@Entity()
export class PaymentTransaction {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @Column()
    amount: number;

    @Column()
    taxAmount: number;

    @Column()
    untaxedAmount: number;

    @Column()
    currency: string;

    @Column()
    paymentChannelId: string

    @Column()
    paymentId: string;

    @Column()
    targetAccountId: string;

    @Column()
    sourceAccountId: string;

    @Column()
    status: 'INITIATED' | 'PENDING' | 'COMPLETED' | 'FAILED' | 'CANCELLED';

    @Column()
    approved: boolean;

    @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
    createdAt: Date;

    @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP', onUpdate: 'CURRENT_TIMESTAMP' })
    updatedAt: Date;

    @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP', onUpdate: 'CURRENT_TIMESTAMP' })
    lastOperationDate: Date;

    @Column({ type: "mediumtext", nullable: true, default: "" })
    operationNote: string;

    @Column({ type: "mediumtext", nullable: true, default: "" })
    description: string;
    // Additional fields can be added as needed

}
