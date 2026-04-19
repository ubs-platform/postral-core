import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity()
export class PostralPaymentEvent {
    @PrimaryGeneratedColumn('uuid')
    id!: string;

    @Column({ length: 100 })
    eventType!: string;

    @Column({ length: 100 })
    aggregateType!: string;

    @Column()
    aggregateId!: string;

    @Column({ nullable: true })
    sellerAccountId?: string;

    @Column({ nullable: true })
    accountId?: string;

    @Column({ type: 'longtext' })
    payload!: string;

    @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
    occurredAt!: Date;
}
