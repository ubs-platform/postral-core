export class ItemPriceDTO {
    public static DEFAULT_VARIATION = 'default';

    id: string;

    itemId: string;

    variation: string;

    itemPrice: number;

    currency: string;

    /* 0 default fiyatıdır, activityOrder en yüksek olan tercih edilir. Kampanya gibi durumlarda bu artırılarak önceliği yükselir ve bu fiyattan verilir */
    activityOrder: number;
}
