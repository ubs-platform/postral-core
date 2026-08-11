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
     * Web sitesi. Kurumsal ya da şahısın kendi web sitesi... Örn: www.tetakent.com
     */
    @Column({ nullable: true })
    website?: string;

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


    /**
     * E-posta adresi (diğer PII gibi şifreli saklanır). Örn: derdinekeder_alayinagider_asaletinyeter_kasapserdar@sagolera.com
     */
    @Column({ nullable: true, length: 100 })
    emailAddress?: string;


    @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
    createdAt: Date;

    @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
    updatedAt: Date;

    // Harici platform (Hepsiburada, Trendyol vb.) müşteri eşlemesi için.
    // externalPlatformId null olabilir; unique kısıt yalnızca dolu çiftlerde işler
    // (MariaDB çoklu NULL'a izin verir, normal Postral hesapları kısıtlanmaz).
    @Column({ nullable: true })
    externalPlatformId?: string;

    @ManyToOne(() => ExternalPlatform, { eager: false, nullable: true })
    @JoinColumn({ name: 'externalPlatformId' })
    externalPlatform?: ExternalPlatform;

    // Harici platformdaki müşteri kimliği (o platform içindeki hesap id'si. Eğer bu bilgi sağlanmıyorsa iletişim bilgisi kullanılabilir.. mi...).
    @Column({ nullable: true })
    externalPlatformAccountId?: string;
}
