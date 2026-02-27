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

    /**
     * This field is used to determine if the tax is public or private.
     *  If it's public, it can be used by any account. If it's private, 
     * it can only be used by the account that created it.
     */
    @Column()
    isPublic: boolean;

    @OneToMany(() => ItemTaxVariation, (variation) => variation.itemTax, {
        cascade: true,
        onDelete: 'CASCADE',
        orphanedRowAction: 'delete',
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
