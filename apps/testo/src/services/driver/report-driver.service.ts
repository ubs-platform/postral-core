import { Injectable } from "@nestjs/common";
import { ReportQueryControllerService } from "../client/report-query-controller.service";
import { AccountSetupResult } from "./account-driver.service";

@Injectable()
export class ReportDriverService {
    constructor(private readonly reportQueryController: ReportQueryControllerService) {}

    async setup(accounts: AccountSetupResult) {
        const { kantciHusoComm, doofenshmirtzComm, tetakentComm } = accounts;
        await Promise.all([
            this.reportQueryController.add({ dateGrouping: "DAILY", ownerAccountId: kantciHusoComm.id, reportType: "SELLER", id: "", name: "Kantçı Hüso - Günlük Satış Raporu" }),
            this.reportQueryController.add({ dateGrouping: "ALL", ownerAccountId: kantciHusoComm.id, reportType: "SELLER", id: "", name: "Kantçı Hüso - Tüm Satış Raporu" }),
            this.reportQueryController.add({ dateGrouping: "DAILY", ownerAccountId: doofenshmirtzComm.id, reportType: "SELLER", id: "", name: "Doofenshmirtz Evil Inc. - Günlük Satış Raporu" }),
            this.reportQueryController.add({ dateGrouping: "ALL", ownerAccountId: doofenshmirtzComm.id, reportType: "SELLER", id: "", name: "Doofenshmirtz Evil Inc. - Tüm Satış Raporu" }),
            this.reportQueryController.add({ dateGrouping: "DAILY", ownerAccountId: tetakentComm.id, reportType: "PLATFORM", id: "", name: "Tetakent Ltd. Şti. - Günlük Platform Kazancı Raporu" }),
        ]);
        console.info("Rapor sorguları oluşturuldu.");
    }
}
