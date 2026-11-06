import {
    Column,
    CreateDateColumn,
    Entity,
    PrimaryGeneratedColumn,
    UpdateDateColumn,
} from 'typeorm';

export type WebhookMethod = 'POST' | 'PUT';

@Entity()
export class WebhookConfig {
    @PrimaryGeneratedColumn('uuid')
    id!: string;

    @Column()
    accountId!: string;

    @Column({ length: 500 })
    url!: string;

    @Column({ length: 10, default: 'POST' })
    method!: WebhookMethod;

    // CryptionUtil ile şifreli saklanır (WebhookConfigService); API'ye yalnızca
    // oluşturma/yenileme anında açık metin döner, diğer durumlarda maskelenir.
    @Column({ length: 500 })
    eventKey!: string;

    @Column({ default: true })
    isEnabled!: boolean;

    @CreateDateColumn()
    createdAt!: Date;

    @UpdateDateColumn()
    updatedAt!: Date;
}
