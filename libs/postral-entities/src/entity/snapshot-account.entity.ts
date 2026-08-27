import { Column, Entity, ManyToOne, PrimaryGeneratedColumn, OneToMany } from 'typeorm';
import { Payment } from './payment.entity';
import { SnapshotBankAccount } from './snapshot-bank-account.entity';

@Entity()
export class SnapshotAccount {
    @PrimaryGeneratedColumn('uuid')
    id!: string;

    @Column()
    realAccountId!: string;

    @Column()
    name!: string;

    @Column()
    legalIdentity!: string;

    @Column()
    phone?: string;

    @Column()
    website?: string;

    @Column()
    emailAddress?: string;

    @Column()
    type!: 'INDIVIDUAL' | 'COMMERCIAL';

    /**
     * @deprecated Use bankAccounts instead
     */
    @Column({ nullable: true })
    bankName?: string;

    /**
     * @deprecated Use bankAccounts instead
     */
    @Column({ nullable: true })
    bankIban?: string;

    /**
     * @deprecated Use bankAccounts instead
     */
    @Column({ nullable: true })
    bankBic?: string;

    /**
     * @deprecated Use bankAccounts instead
     */
    @Column({ nullable: true })
    bankSwift?: string;

    @OneToMany(() => SnapshotBankAccount, bankAccount => bankAccount.account, { cascade: true })
    bankAccounts!: SnapshotBankAccount[];

    @Column({ nullable: true })
    taxOffice?: string;
}

