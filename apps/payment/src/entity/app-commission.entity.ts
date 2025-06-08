import { Column, Entity, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';
import { Payment } from './payment.entity';

@Entity()
export class AppComission {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @Column()
    default: boolean;

    @Column()
    itemSellerAccountId: string;

    @Column()
    appAccountId: string;

    @Column()
    percent: number;
}
