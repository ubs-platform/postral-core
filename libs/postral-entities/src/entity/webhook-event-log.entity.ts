import {
    Column,
    Entity,
    JoinColumn,
    ManyToOne,
    PrimaryGeneratedColumn,
} from 'typeorm';
import { WebhookConfig } from './webhook-config.entity';

@Entity()
export class WebhookEventLog {
    @PrimaryGeneratedColumn('uuid')
    id!: string;

    @Column()
    webhookConfigId!: string;

    @ManyToOne(() => WebhookConfig, { nullable: false, onDelete: 'CASCADE', eager: false })
    @JoinColumn({ name: 'webhookConfigId' })
    webhookConfig!: WebhookConfig;

    @Column({ length: 100 })
    eventType!: string;

    @Column({ type: 'longtext' })
    payload!: string;

    @Column({ nullable: true })
    statusCode?: number;

    @Column({ type: 'longtext', nullable: true })
    responseBody?: string;

    @Column({ default: 0 })
    retryCount!: number;

    @Column({ type: 'timestamp', nullable: true })
    retryAfter?: Date;

    @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
    occurredAt!: Date;

    @Column({ type: 'timestamp', nullable: true })
    deliveredAt?: Date;
}
