import { Column, Entity, PrimaryColumn } from 'typeorm';
import { PlatformSetupSettingsDTO } from '@tk-postral/payment-common';

@Entity()
export class PlatformSetup {
    @PrimaryColumn({ length: 30 })
    id: string = 'platform';

    @Column({ default: 1 })
    version: number = 1;

    @Column({ length: 20, default: 'IN_PROGRESS' })
    status: 'IN_PROGRESS' | 'COMPLETED' = 'IN_PROGRESS';

    @Column()
    startedByUserId!: string;

    @Column({ nullable: true })
    teamName?: string;

    @Column({ nullable: true })
    teamId?: string;

    @Column()
    teamCreationKey!: string;

    @Column()
    addressId!: string;

    @Column()
    platformAccountId!: string;

    @Column({ nullable: true })
    platformAccountName?: string;

    @Column({ default: false })
    platformSaved: boolean = false;

    @Column({ default: false })
    platformOwnershipReady: boolean = false;

    @Column()
    sellerAddressId!: string;

    @Column()
    sellerAccountId!: string;

    @Column({ nullable: true })
    sellerAccountName?: string;

    @Column({ default: false })
    sellerSaved: boolean = false;

    @Column({ default: false })
    sellerOwnershipReady: boolean = false;

    @Column()
    taxId!: string;

    @Column({ type: 'simple-json', nullable: true })
    settings?: PlatformSetupSettingsDTO;

    @Column({ type: 'simple-json', nullable: true })
    additionalTaxIds?: string[];

    @Column({ nullable: true })
    leaseToken?: string;

    @Column({ type: 'datetime', nullable: true })
    leaseUntil?: Date | null;

    @Column({ type: 'datetime', nullable: true })
    completedAt?: Date;
}
