import { Column, Entity, ManyToOne, PrimaryGeneratedColumn, JoinColumn } from 'typeorm';
import { Account } from './account.entity';

@Entity()
export class BankAccount {
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

    @ManyToOne(() => Account, account => account.bankAccounts, { onDelete: 'CASCADE' })
    @JoinColumn({ name: 'accountId' })
    account!: Account;
    
    @Column()
    accountId!: string;
}

