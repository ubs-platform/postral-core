import {
    Entity,
    Column,
    PrimaryGeneratedColumn,
    ManyToOne,
    BaseEntity,
} from 'typeorm';
import { RefundRequest } from './refund-request.entity';

@Entity()
export class RefundRequestItem extends BaseEntity {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @ManyToOne(() => RefundRequest, (request) => request.items, {
        onDelete: 'CASCADE',
    })
    refundRequest: RefundRequest;

    @Column()
    paymentItemId: string;

    @Column({ type: 'float' })
    refundCount: number;
}
