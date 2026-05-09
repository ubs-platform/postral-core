import { Injectable } from "@nestjs/common";
import { AccountNewControllerService } from "../client/account-new-controller.service";
import { AccountDTO } from "@tk-postral/payment-common";

export interface AccountSetupResult {
    huseyinIndiv: AccountDTO;
    cansuIndiv: AccountDTO;
    efeIndiv: AccountDTO;
    kantciHusoComm: AccountDTO;
    doofenshmirtzComm: AccountDTO;
    tetakentComm: AccountDTO;
}

@Injectable()
export class AccountDriverService {
    constructor(private readonly account: AccountNewControllerService) {}

    async setup(defaultAddressId: string): Promise<AccountSetupResult> {
        const [huseyinIndiv, cansuIndiv, efeIndiv, kantciHusoComm, doofenshmirtzComm, tetakentComm] = await Promise.all([
            this.account.add({ name: "Hüseyin", legalIdentity: "12345678901", type: "INDIVIDUAL", defaultAddressId, id: "" }),
            this.account.add({ name: "Cansu", legalIdentity: "12345678902", type: "INDIVIDUAL", defaultAddressId, id: "" }),
            this.account.add({ name: "Efe", legalIdentity: "12345678903", type: "INDIVIDUAL", defaultAddressId, id: "" }),
            this.account.add({ name: "Kantçı Hüso", legalIdentity: "12345678904", type: "COMMERCIAL", defaultAddressId, id: "" }),
            this.account.add({ name: "Doofenshmirtz Evil Inc.", legalIdentity: "12345678905", type: "COMMERCIAL", defaultAddressId, id: "" }),
            this.account.add({ name: "Tetakent Ltd. Şti.", legalIdentity: "12345678906", type: "COMMERCIAL", defaultAddressId, id: "" }),
        ]);
        console.info("Hesaplar oluşturuldu.");
        return { huseyinIndiv, cansuIndiv, efeIndiv, kantciHusoComm, doofenshmirtzComm, tetakentComm };
    }
}
