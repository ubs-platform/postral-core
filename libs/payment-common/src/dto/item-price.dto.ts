export class ItemPriceDefaults {
    public static VARIATION_DEFAULT = 'default';
    public static REGION_ANY = 'any';
}

export interface ItemPriceDTO {
    id: string;

    itemId: string;

    variation: string;

    itemPrice: number;

    currency: string;

    // taxPercent: number;

    region: string;

    /* 0 default fiyatıdır, activityOrder en yüksek olan tercih edilir. Kampanya gibi durumlarda bu artırılarak önceliği yükselir ve bu fiyattan verilir */
    activityOrder: number;

    activeStartAt?: Date;

    activeExpireAt?: Date;

    /** Farklı para biriminde dönüşebilir... (sonra kullanılabilir) */
    automaticExchangeFromCurrency?: string;
}

export interface ItemPriceSearchDTO {
    itemId: string | string[];

    variation?: string;

    currency?: string;

    region?: string;
}
