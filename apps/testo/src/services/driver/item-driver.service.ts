import { Injectable } from "@nestjs/common";
import { ItemControllerService } from "../client/item-controller.service";
import { ItemDTO, ItemPriceDTO } from "@tk-postral/payment-common";
import { AccountSetupResult } from "./account-driver.service";
import { TaxSetupResult } from "./tax-driver.service";

@Injectable()
export class ItemDriverService {
    constructor(private readonly itemService: ItemControllerService) {}

    private priceEntries(item: ItemDTO, defaultPrice: number, premiumPrice: number): Promise<ItemPriceDTO>[] {
        return [
            this.itemService.addDefaultPrice(item.id, { currency: "TRY", itemPrice: defaultPrice, variation: "default", region: "", id: "", itemId: item.id, activityOrder: 0 }),
            this.itemService.addDefaultPrice(item.id, { currency: "TRY", itemPrice: premiumPrice, variation: "premium", region: "", id: "", itemId: item.id, activityOrder: 0 }),
        ];
    }

    async setup(accounts: AccountSetupResult, taxes: TaxSetupResult) {
        const { kantciHusoComm, doofenshmirtzComm } = accounts;
        const { tax10, tax20 } = taxes;

        const [khItem1, khItem2, doofItem1, doofItem2] = await Promise.all([
            this.itemService.add({ name: "Diyalektik Çatışmanın Kebapsal Bağlamı", baseCurrency: "TRY", sellerAccountId: kantciHusoComm.id, itemTaxId: tax10.id, unit: "C62", id: "" }),
            this.itemService.add({ name: "Çelişkili dürüm", baseCurrency: "TRY", sellerAccountId: kantciHusoComm.id, itemTaxId: tax20.id, unit: "C62", itemClass: "reduced", id: "" }),
            this.itemService.add({ name: "Fox'u geri alma-inatör", baseCurrency: "TRY", sellerAccountId: doofenshmirtzComm.id, itemTaxId: tax20.id, unit: "C62", id: "" }),
            this.itemService.add({ name: "The Walt Disney Company şirketini konkordatoya girmeden batırıcı-inatör", baseCurrency: "TRY", sellerAccountId: doofenshmirtzComm.id, itemTaxId: tax10.id, unit: "C62", itemClass: "reduced", id: "" }),
        ]);
        console.info("Ürünler oluşturuldu.");

        await Promise.all([
            ...this.priceEntries(khItem1, 199, 299),
            ...this.priceEntries(khItem2, 199, 299),
            ...this.priceEntries(doofItem1, 99, 199),
            ...this.priceEntries(doofItem2, 99, 199),
        ]);
        console.info("Ürün fiyatları oluşturuldu.");
    }
}
