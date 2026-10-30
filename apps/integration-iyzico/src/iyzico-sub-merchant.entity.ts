import { Column, Entity, PrimaryColumn, UpdateDateColumn } from 'typeorm';

/**
 * Postral hesabı ile iyzico alt üye işyeri eşlemesi. Kişisel veri tutulmaz;
 * `payloadHash` yalnızca gönderilen verinin değişip değişmediğini anlamak içindir.
 */
@Entity('iyzico_sub_merchant')
export class IyzicoSubMerchant {
    @PrimaryColumn('uuid')
    accountId!: string;

    @Column({ type: 'varchar', nullable: true })
    subMerchantKey!: string | null;

    @Column({ type: 'varchar', nullable: true })
    subMerchantType!: string | null;

    @Column({ type: 'varchar', length: 64, nullable: true })
    payloadHash!: string | null;

    @UpdateDateColumn()
    updatedAt!: Date;
}
