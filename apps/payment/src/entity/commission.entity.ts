import { Column, Entity, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';
import { Payment } from './payment.entity';

@Entity()
export class Comission {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @Column()
    sellerAccountId: string;
    
    @Column()
    applicationAccountId: string;

    @Column()
    identity: string;

    @Column()
    type: 'INDUVIDIAL' | 'COMMERCIAL';
}
