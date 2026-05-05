import { Column, Entity, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';
import { Payment } from './payment.entity';

@Entity()
export class InvoiceAccount {
    @PrimaryGeneratedColumn('uuid')
    id!: string;

    @Column()
    realAccountId!: string;

    @Column()
    name!: string;

    @Column()
    legalIdentity!: string;

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
