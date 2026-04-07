import { Body, Controller, Get, Put, UseGuards } from "@nestjs/common";
import { AdminSettingsService } from "../service/admin-settings.service";
import { JwtAuthGuard } from "@ubs-platform/users-microservice-helper";
import { Roles, RolesGuard } from "@ubs-platform/users-roles";
import { AdminSettings } from "../entity";

@Controller("admin-settings")
export class AdminSettingsController {
    // This controller will handle admin settings related to payments, such as commission rates, fee structures, etc.
    // For now, it's just a placeholder and can be implemented with actual endpoints as needed.

    constructor(private readonly adminSettingsService: AdminSettingsService) {}
        
    @Get()
    @UseGuards(JwtAuthGuard, RolesGuard)
    @Roles(["admin", "postral-admin"])
    async getAdminSettings() {
        return await this.adminSettingsService.getAdminSettings();
    }

    @Put()
    @UseGuards(JwtAuthGuard, RolesGuard)
    @Roles(["admin", "postral-admin"])
    async updateAdminSettings(@Body() settings: Partial<AdminSettings>) {
        return await this.adminSettingsService.upsertAdminSettings(settings);
    }
}