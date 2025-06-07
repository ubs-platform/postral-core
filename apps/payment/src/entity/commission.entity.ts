import { Column, Entity, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';
import { Payment } from './payment.entity';

@Entity()
export class Comission {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @Column()
    accountId: string;

    @Column()
    identity: string;

    @Column()
    type: 'INDUVIDIAL' | 'COMMERCIAL';
}
