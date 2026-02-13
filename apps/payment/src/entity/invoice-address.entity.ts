import { Column, Entity, PrimaryGeneratedColumn } from "typeorm";

@Entity()
export class InvoiceAddress {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @Column()
    name: string;

    /** Bina numarası (örn: "42", "123A") */
    @Column({ nullable: true })
    buildingNumber?: string;

    /** Bina adı (örn: "Güneş Plaza") */
    @Column({ nullable: true })
    buildingName?: string;

    /** Oda/Daire numarası */
    @Column({ nullable: true })
    room?: string;

    /** Kat numarası */
    @Column({ nullable: true })
    floor?: string;

    /** Blok adı (örn: "A Blok") */
    @Column({ nullable: true })
    blockName?: string;

    /** Sokak/Cadde adı */
    @Column()
    streetName: string;

    /** Ek sokak bilgisi */
    @Column({ nullable: true })
    additionalStreetName?: string;

    /** Mahalle adı */
    @Column({ nullable: true })
    district?: string;

    /** İlçe adı */
    @Column()
    citySubdivisionName: string;

    /** Şehir/İl adı */
    @Column()
    cityName: string;

    /** Posta kodu */
    @Column()
    postalZone: string;

    /** Bölge/Region (örn: "Marmara") */
    @Column({ nullable: true })
    region?: string;

    /** Posta kutusu numarası */
    @Column({ nullable: true })
    postbox?: string;

    /** Ülke adı */
    @Column()
    country: string;

    /** Ülke alt bölümü (örn: eyalet, il) */
    @Column({ nullable: true })
    countrySubentity?: string;

    /** Ülke alt bölüm kodu (ISO 3166-2) */
    @Column({ nullable: true })
    countrySubentityCode?: string;

    /** Adres format kodu */
    @Column({ nullable: true })
    addressFormatCode?: string;

    /** Adres tipi kodu (örn: "residential", "commercial") */
    @Column({ nullable: true })
    addressTypeCode?: string;

    /** Departman/Bölüm adı */
    @Column({ nullable: true })
    department?: string;

    /** Dikkat: ... (kişi/birim belirteci) */
    @Column({ nullable: true })
    markAttention?: string;

    /** ... nezaretinde (kişi/birim belirteci) */
    @Column({ nullable: true })
    markCare?: string;

    /** Parsel/Ada numarası */
    @Column({ nullable: true })
    plotIdentification?: string;

    /** Şehir plaka kodu */
    @Column({ nullable: true })
    cityCode?: string;

    /** İç adres tanımı (örn: site içi konum) */
    @Column({ nullable: true })
    inhaleName?: string;

    /** Zaman dilimi (örn: "Europe/Istanbul") */
    @Column({ nullable: true })
    timezone?: string;

    
}