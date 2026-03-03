import {
    Column,
    Entity,
    JoinColumn,
    ManyToOne,
    OneToMany,
    PrimaryGeneratedColumn,
} from 'typeorm';
import { Payment } from './payment.entity';
import { Address } from './address.entity';

@Entity()
export class Account {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @Column()
    name: string;

    /**
     * Eğer kişiselse TCKN, şirketse Vergi numarası
     */
    @Column()
    legalIdentity: string;

    /**
     * Kişisel veya Sirket
     */
    @Column()
    type: 'INDIVIDUAL' | 'COMMERCIAL';

    @Column({ nullable: true })
    defaultAddressId?: string;

    @ManyToOne(() => Address, { eager: false, nullable: true })
    @JoinColumn({ name: 'defaultAddressId' })
    defaultAddress?: Address;

    @Column({ nullable: false, type: 'boolean', default: false })
    deactivated: boolean;

    // Banka bilgileri
    @Column({ nullable: true })
    bankName?: string;

    @Column({ nullable: true })
    bankIban?: string;

    @Column({ nullable: true })
    bankBic?: string;

    @Column({ nullable: true })
    bankSwift?: string;
}
