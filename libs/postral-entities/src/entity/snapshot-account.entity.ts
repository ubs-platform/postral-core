import { Column, Entity, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';
import { Payment } from './payment.entity';

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

    @Column({ nullable: true })
    bankName?: string;

    @Column({ nullable: true })
    bankIban?: string;

    @Column({ nullable: true })
    bankBic?: string;

    @Column({ nullable: true })
    bankSwift?: string;

    @Column({ nullable: true })
    taxOffice?: string;
}


/**
 * @deprecated
 * 
 * eski versiyonlardan migrate edilirken kullanılıyor. Yeni versiyonda SnapshotAccount kullanılacak.
 */
@Entity({name: 'invoice_account'})
export class InvoiceAccountLegacy {
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

    @Column({ nullable: true })
    bankName?: string;

    @Column({ nullable: true })
    bankIban?: string;

    @Column({ nullable: true })
    bankBic?: string;

    @Column({ nullable: true })
    bankSwift?: string;

    @Column({ nullable: true })
    taxOffice?: string;
}