import { Controller, Post, UseGuards } from "@nestjs/common";
import { JwtAuthGuard } from "@ubs-platform/users-microservice-helper";
import { Roles, RolesGuard } from "@ubs-platform/users-roles";
import { AdminOperationsService } from "../service/admin-operations.service";
import { BillingService } from "../service/billing.service";

@Controller("admin-operations")
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(["admin", "postral-admin"])
export class AdminOperationsController {
    constructor(
        private admOps: AdminOperationsService,
        private billingService: BillingService,
    ) {}

    @Post("encrypt-sensitive-data")
    async encryptSensitiveData() {
        await this.admOps.changeAllSensitiveData("ENCRYPTED");
    }

    @Post("decrypt-sensitive-data")
    async decryptSensitiveData() {
        await this.admOps.changeAllSensitiveData("DECRYPTED");
    }

    /**
     * Tüm satıcılar için faturalanmamış günlük raporları toplayıp
     * komisyon ve hakediş fatura payment'larını oluşturur.
     * Admin panelinden manuel tetiklemek için kullanılır.
     */
    @Post("run-billing")
    async runBilling() {
        await this.billingService.runBilling(undefined, "THROW");
    }
}
