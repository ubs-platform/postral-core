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
    variation: string;

    @Column()
    paymentItemId: string;

    @Column({ type: 'float' })
    refundCount: number;

    @Column({ nullable: true })
    itemName?: string;

    @Column({ type: 'float', nullable: true })
    unitAmount?: number;

    @Column({ type: 'float', nullable: true })
    unitAmountWithoutTax?: number;

    @Column({ type: 'float', nullable: true })
    refundAmount?: number;

    @Column({ type: 'float', nullable: true })
    refundAmountWithoutTax?: number;

    @Column({ type: 'float', nullable: true })
    refundTaxAmount?: number;
}
