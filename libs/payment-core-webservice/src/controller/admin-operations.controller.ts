import { Body, Controller, Get, Param, Post, StreamableFile, UseGuards } from "@nestjs/common";
import { JwtAuthGuard } from "@ubs-platform/users-microservice-helper";
import { Roles, RolesGuard } from "@ubs-platform/users-roles";
import { AdminOperationsService } from "../service/admin-operations.service";
import { BillingService } from "../service/billing.service";
import { PaymentCleanupOptions, PaymentCleanupRequest, PaymentCleanupService } from "../service/payment-cleanup.service";

@Controller("admin-operations")
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(["admin", "POSTRAL-ADMIN"])
export class AdminOperationsController {
    constructor(
        private admOps: AdminOperationsService,
        private billingService: BillingService,
        private paymentCleanupService: PaymentCleanupService,
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

    @Post("payment-cleanup/preview")
    async previewPaymentCleanup(@Body() options: PaymentCleanupOptions = {}) {
        return this.paymentCleanupService.preview(options);
    }

    @Post("payment-cleanup/archive")
    async archivePaymentCleanup(@Body() options: PaymentCleanupOptions = {}) {
        return this.paymentCleanupService.createArchive(options);
    }

    @Get("payment-cleanup/archives")
    async listPaymentArchives() {
        return this.paymentCleanupService.listArchives();
    }

    @Get("payment-cleanup/archive/:archiveId")
    async downloadPaymentArchive(@Param("archiveId") archiveId: string): Promise<StreamableFile> {
        const archive = await this.paymentCleanupService.getArchiveStream(archiveId);
        return new StreamableFile(archive.stream as any, {
            disposition: `attachment; filename="${archive.fileName}"`,
            type: 'application/sql',
        });
    }

    @Post("payment-cleanup/cleanup")
    async cleanupPayments(@Body() request: PaymentCleanupRequest) {
        return this.paymentCleanupService.cleanup(request);
    }
}
