import { Column, Entity, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';
import { Payment } from './payment.entity';

@Entity()
export class Item {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @Column()
    entityGroup: string;

    @Column()
    entityName: string;

    @Column()
    entityId: string;

    @Column()
    unit: string;

    @Column()
    taxPercent: number;

    @Column()
    originalUnitAmount: number;
}
