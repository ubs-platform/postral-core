import { Column, Entity, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';
import { Payment } from './payment.entity';

@Entity()
export class InvoiceAccount {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @Column()
    realAccountId: string;

    @Column()
    name: string;

    @Column()
    legalIdentity: string;

    @Column()
    type: 'INDIVIDUAL' | 'COMMERCIAL';

}
