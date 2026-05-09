import { Injectable } from "@nestjs/common";
import { AuthControllerService } from "../client/auth-controller.service";
import { HttpService } from "@nestjs/axios";
import { CommissionDriverService } from "./commission-driver.service";
import { AddressDriverService } from "./address-driver.service";
import { AccountDriverService } from "./account-driver.service";
import { TaxDriverService } from "./tax-driver.service";
import { ItemDriverService } from "./item-driver.service";
import { ReportDriverService } from "./report-driver.service";

@Injectable()
export class MainDriverService {
    constructor(
        private readonly httpService: HttpService,
        private readonly loginOperator: AuthControllerService,
        private readonly commissionDriver: CommissionDriverService,
        private readonly addressDriver: AddressDriverService,
        private readonly accountDriver: AccountDriverService,
        private readonly taxDriver: TaxDriverService,
        private readonly itemDriver: ItemDriverService,
        private readonly reportDriver: ReportDriverService,
    ) {
        console.info("MainDriverService initialized");
    }

    async initialOperations() {
        // UBS Platformda default username ve password "kyle"dır. Neden "kyle" olduğunu lütfen sormayın :d
        const loginInfo = await this.loginOperator.authenticate({ login: "kyle", password: "kyle" });
        const token = loginInfo.token;
        if (!token) {
            console.error("Authentication failed. No token received.");
            return;
        }
        console.info("Authentication successful. Token received.");
        this.httpService.axiosRef.defaults.headers.common['Authorization'] = `Bearer ${token}`;

        const [, address] = await Promise.all([
            this.commissionDriver.setup(),
            this.addressDriver.setup(),
        ]);

        const accounts = await this.accountDriver.setup(address.id!);
        const taxes = await this.taxDriver.setup(accounts.tetakentComm.id);
        await this.itemDriver.setup(accounts, taxes);
        await this.reportDriver.setup(accounts);
    }
}