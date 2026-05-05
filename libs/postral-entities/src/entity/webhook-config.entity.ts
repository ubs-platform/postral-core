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

    // TODO: Bu alan DB'ye yazılmadan önce CryptionUtil.encryptWithConfig ile şifrelenmelidir.
    // Şifrelenmiş alan decrypt edilmeden asla dışarıya döndürülmemeli.
    @Column({ length: 500 })
    eventKey!: string;

    @Column({ default: true })
    isEnabled!: boolean;

    @CreateDateColumn()
    createdAt!: Date;

    @UpdateDateColumn()
    updatedAt!: Date;
}
