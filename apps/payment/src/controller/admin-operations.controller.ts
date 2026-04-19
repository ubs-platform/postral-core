import { Controller, Post, UseGuards } from "@nestjs/common";
import { JwtAuthGuard } from "@ubs-platform/users-microservice-helper";
import { Roles, RolesGuard } from "@ubs-platform/users-roles";
import { AdminOperationsService } from "../service/admin-operations.service";

@Controller("admin-operations")
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(["admin", "postral-admin"])
export class AdminOperationsController {
    constructor(private admOps: AdminOperationsService) { }

    @Post("encrypt-sensitive-data")
    async encryptSensitiveData() {
        await this.admOps.changeAllSensitiveDataToEncrypted("ENCRYPTED");
    }

    @Post("decrypt-sensitive-data")
    async decryptSensitiveData() {
        await this.admOps.changeAllSensitiveDataToEncrypted("DECRYPTED");
    }
}