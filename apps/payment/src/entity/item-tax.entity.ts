import {
    Column,
    Entity,
    JoinColumn,
    JoinTable,
    ManyToOne,
    OneToMany,
    PrimaryGeneratedColumn,
} from 'typeorm';

@Entity()
export class ItemTaxEntity {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @Column()
    taxName: string;

    @OneToMany(() => ItemTaxVariation, (variation) => variation.itemTax, {
        cascade: true,
    })
    @JoinColumn()
    variations: ItemTaxVariation[];
}
@Entity()
export class ItemTaxVariation {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @Column()
    taxMode: string;

    @Column()
    taxRate: number;

    @ManyToOne(() => ItemTaxEntity, (itemTax) => itemTax.variations)
    itemTax: ItemTaxEntity;
}
