export class AccountAddressDto {
    id?: string;

    name: string;

    entityOwnershipGroupId?: string;

    

    // UBL Address Fields

    /** Bina numarası (örn: "42", "123A") */
    buildingNumber?: string;

    /** Bina adı (örn: "Güneş Plaza") */
    buildingName?: string;

    /** Oda/Daire numarası */
    room?: string;

    /** Kat numarası */
    floor?: string;

    /** Blok adı (örn: "A Blok") */
    blockName?: string;

    /** Sokak/Cadde adı */
    streetName: string;

    /** Ek sokak bilgisi */
    additionalStreetName?: string;

    /** Mahalle adı */
    district?: string;

    /** İlçe adı */
    citySubdivisionName: string;

    /** Şehir/İl adı */
    cityName: string;

    /** Posta kodu */
    postalZone: string;

    /** Bölge/Region (örn: "Marmara") */
    region?: string;

    /** Posta kutusu numarası */
    postbox?: string;

    /** Ülke adı */
    country: string;

    /** Ülke alt bölümü (örn: eyalet, il) */
    countrySubentity?: string;

    /** Ülke alt bölüm kodu (ISO 3166-2) */
    countrySubentityCode?: string;

    /** Adres format kodu */
    addressFormatCode?: string;

    /** Adres tipi kodu (örn: "residential", "commercial") */
    addressTypeCode?: string;

    /** Departman/Bölüm adı */
    department?: string;

    /** Dikkat: ... (kişi/birim belirteci) */
    markAttention?: string;
    /** ... nezaretinde (kişi/birim belirteci) */
    markCare?: string;

    /** Parsel/Ada numarası */
    plotIdentification?: string;

    /** Şehir plaka kodu */
    cityCode?: string;
    /** İç adres tanımı (örn: site içi konum) */
    inhaleName?: string;

    /** Zaman dilimi (örn: "Europe/Istanbul") */
    timezone?: string;
}

export class AddressSearchParamsDTO {
    id?: string;

    name?: string;

    admin?: 'true' | 'false';

    ownerUserId?: string;

    entityOwnershipGroupId?: string;
}
