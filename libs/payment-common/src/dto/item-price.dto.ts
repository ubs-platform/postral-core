export class ItemPriceDTO {
    public static VARIATION_DEFAULT = 'default';
    public static COUNTRY_ANY = 'any-c';

    id: string;

    itemId: string;

    variation: string;

    itemPrice: number;

    currency: string;

    taxPercent: number;

    country: string;

    /* 0 default fiyatıdır, activityOrder en yüksek olan tercih edilir. Kampanya gibi durumlarda bu artırılarak önceliği yükselir ve bu fiyattan verilir */
    activityOrder: number;
}
