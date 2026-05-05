import { Column, Entity, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';
import { Payment } from './payment.entity';

@Entity()
export class Item {
    @PrimaryGeneratedColumn('uuid')
    id!: string;

    @Column()
    name!: string;

    @Column()
    entityGroup!: string;

    @Column()
    entityName!: string;

    @Column()
    entityId!: string;

    @Column()
    unit!: string;

    @Column()
    baseCurrency!: string;

    @Column()
    itemTaxId!: string;

    // @Column({type: 'float'})
    // taxPercent!: number;

    // @Column({type: 'float'})
    // unitAmount!: number;

    // @Column({type: 'float'})
    // originalUnitAmount!: number;

    @Column()
    sellerAccountId!: string;

    @Column()
    itemClass: string = "";
}
