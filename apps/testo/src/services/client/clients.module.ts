import { Module } from "@nestjs/common";
import { AddressControllerService } from "./address-controller.service";
import { AccountNewControllerService } from "./account-new-controller.service";
import { AdminOperationsControllerService } from "./admin-operations-controller.service";
import { PaymentControllerService } from "./payment-controller.service";
import { ItemControllerService } from "./item-controller.service";
import { ItemTaxControllerService } from "./item-tax-controller.service";
import { InvoiceControllerService } from "./invoice-controller.service";
import { RefundControllerService } from "./refund-controller.service";
import { ReportQueryControllerService } from "./report-query-controller.service";
import { AdminSettingsControllerService } from "./admin-settings-controller.service";
import { AppComissionControllerService } from "./app-comission-controller.service";

@Module({
    imports: [
        
    ],
    controllers: [
        
    ],
    providers: [
        AddressControllerService,
        AccountNewControllerService,
        AdminOperationsControllerService,
        PaymentControllerService,
        ItemControllerService,
        ItemTaxControllerService,
        InvoiceControllerService,
        RefundControllerService,
        ReportQueryControllerService,
        ItemTaxControllerService,
        AdminSettingsControllerService,
        AppComissionControllerService,
    ],
    exports: [
        AddressControllerService,
        AccountNewControllerService,
        AdminOperationsControllerService,
        PaymentControllerService,
        ItemControllerService,
        ItemTaxControllerService,
        InvoiceControllerService,
        RefundControllerService,
        ReportQueryControllerService,
        ItemTaxControllerService,
        AdminSettingsControllerService,
        AppComissionControllerService,
    ]
})
export class PostralClientsModule {}