import { Column, Entity, JoinColumn, ManyToOne, OneToMany, PrimaryGeneratedColumn } from 'typeorm';
import { Payment } from './payment.entity';
import { Address } from './address.entity';

@Entity()
export class Account {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @Column()
    name: string;

    @Column()
    legalIdentity: string;

    @Column()
    type: 'INDIVIDUAL' | 'COMMERCIAL';

    @Column({ nullable: true })
    defaultAddressId?: string;

    @ManyToOne(() => Address, {eager: false, nullable: true})
    @JoinColumn({ name: 'defaultAddressId' })
    defaultAddress?: Address;

    @Column({ nullable: false, type: 'boolean', default: false })
    deactivated: boolean;
    
}
