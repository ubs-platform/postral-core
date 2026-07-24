import {
    Column,
    Entity,
    JoinColumn,
    ManyToOne,
    OneToMany,
    PrimaryGeneratedColumn,
    Unique,
} from 'typeorm';
import { Payment } from './payment.entity';
import { Address } from './address.entity';
import { ExternalPlatform } from './external-platform.entity';

@Entity()
@Unique(['externalPlatformId', 'externalPlatformAccountId'])
export class Account {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @Column()
    name: string;

    /**
     * Telefon numarası (diğer PII gibi şifreli saklanır).
     */
    @Column({ nullable: true })
    phone?: string;

    /**
     * Eğer kişiselse TCKN, şirketse Vergi numarası
     */
    @Column()
    legalIdentity: string;

    /**
     * Kişisel veya Sirket
     */
    @Column()
    type: 'INDIVIDUAL' | 'COMMERCIAL';

    @Column({ nullable: true })
    defaultAddressId?: string;

    @ManyToOne(() => Address, { eager: false, nullable: true })
    @JoinColumn({ name: 'defaultAddressId' })
    defaultAddress?: Address;

    @Column({ nullable: false, type: 'boolean', default: false })
    deactivated: boolean;

    // Banka bilgileri
    @Column({ nullable: true })
    bankName?: string;

    @Column({ nullable: true })
    bankIban?: string;

    @Column({ nullable: true })
    bankBic?: string;

    @Column({ nullable: true })
    bankSwift?: string;

    @Column({ nullable: true })
    taxOffice?: string;

    // Harici platform (Hepsiburada, Trendyol vb.) müşteri eşlemesi için.
    // externalPlatformId null olabilir; unique kısıt yalnızca dolu çiftlerde işler
    // (MariaDB çoklu NULL'a izin verir, normal Postral hesapları kısıtlanmaz).
    @Column({ nullable: true })
    externalPlatformId?: string;

    @ManyToOne(() => ExternalPlatform, { eager: false, nullable: true })
    @JoinColumn({ name: 'externalPlatformId' })
    externalPlatform?: ExternalPlatform;

    // Harici platformdaki müşteri kimliği (o platform içindeki hesap id'si).
    @Column({ nullable: true })
    externalPlatformAccountId?: string;
}
