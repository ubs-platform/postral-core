import { Column, Entity, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';
import { Payment } from './payment.entity';

@Entity()
export class AppComission {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @Column()
    sellerAccountId: string;

    @Column()
    applicationAccountId: string;

    @Column({ name: 'app_default' })
    default: boolean;

    @Column({type: 'float'})
    percent: number;
}
