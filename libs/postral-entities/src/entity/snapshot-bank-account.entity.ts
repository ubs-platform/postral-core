import { Column, Entity, ManyToOne, PrimaryGeneratedColumn, JoinColumn } from 'typeorm';
import { SnapshotAccount } from './snapshot-account.entity';

@Entity()
export class SnapshotBankAccount {
    @PrimaryGeneratedColumn('uuid')
    id!: string;

    @Column({ nullable: true })
    bankName?: string;

    @Column({ nullable: true })
    bankIban?: string;

    @Column({ nullable: true })
    bankBic?: string;

    @Column({ nullable: true })
    bankSwift?: string;

    @Column({ nullable: true })
    currency?: string;

    @ManyToOne(() => SnapshotAccount, account => account.bankAccounts, { onDelete: 'CASCADE' })
    @JoinColumn({ name: 'snapshotAccountId' })
    account!: SnapshotAccount;
    
    @Column()
    snapshotAccountId!: string;
}

