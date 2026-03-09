import {
    Entity,
    Column,
    PrimaryGeneratedColumn,
    OneToMany,
    BaseEntity,
} from 'typeorm';
import { RefundRequestItem } from './refund-request-item.entity';

export type RefundRequestStatus = 'PENDING' | 'APPROVED' | 'REJECTED';

@Entity()
export class RefundRequest extends BaseEntity {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @Column()
    paymentId: string;

    @Column({
        type: 'varchar',
        default: 'PENDING',
    })
    status: RefundRequestStatus;

    @OneToMany(
        () => RefundRequestItem,
        (item: RefundRequestItem) => item.refundRequest,
        {
            cascade: true,
        },
    )
    items: RefundRequestItem[];

    @Column()
    requestedByAccountId: string;

    @Column({ nullable: true })
    resolvedByAccountId: string;

    @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
    createdAt: Date;

    @Column({
        type: 'timestamp',
        default: () => 'CURRENT_TIMESTAMP',
        onUpdate: 'CURRENT_TIMESTAMP',
    })
    updatedAt: Date;
}
