import { Column, Entity, Index, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';

@Entity()
@Index(['metaEntityGroup', 'metaEntityName', 'metaEntityId'])
export class Item {
    @PrimaryGeneratedColumn('uuid')
    id!: string;

    @Column()
    name!: string;

    @Column()
    entityGroup?: string;

    @Column()
    entityName?: string;

    @Column()
    entityId?: string;

    @Column({ default: false })
    isPhysical: boolean = false;

    @Column({ type: 'varchar', nullable: true })
    metaEntityGroup?: string | null;

    @Column({ type: 'varchar', nullable: true })
    metaEntityName?: string | null;

    @Column({ type: 'varchar', nullable: true })
    metaEntityId?: string | null;

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
