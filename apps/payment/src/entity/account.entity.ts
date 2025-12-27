import { Column, Entity, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';
import { Payment } from './payment.entity';

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

    @Column({ nullable: false, type: 'boolean', default: false })
    deactivated: boolean;
    
}
