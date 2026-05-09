import { Injectable } from "@nestjs/common";
import { ItemTaxControllerService } from "../client/item-tax-controller.service";
import { ItemTaxDTO } from "@tk-postral/payment-common";

export interface TaxSetupResult {
    tax10: ItemTaxDTO;
    tax20: ItemTaxDTO;
}

@Injectable()
export class TaxDriverService {
    constructor(private readonly taxController: ItemTaxControllerService) {}

    async setup(ownerAccountId: string): Promise<TaxSetupResult> {
        const [tax10, tax20] = await Promise.all([
            this.taxController.add({
                taxName: "KDV %10",
                id: "",
                isPublic: true,
                entityOwnershipGroupId: ownerAccountId,
                variations: [{ taxRate: 10, taxMode: "DEFAULT" }],
            }),
            this.taxController.add({
                taxName: "KDV %20",
                id: "",
                isPublic: true,
                entityOwnershipGroupId: ownerAccountId,
                variations: [{ taxRate: 20, taxMode: "DEFAULT" }],
            }),
        ]);
        console.info("Vergi oranları oluşturuldu: %10 ve %20");
        return { tax10, tax20 };
    }
}
