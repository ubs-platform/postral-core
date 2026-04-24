import { Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { AdminSettings } from "../entity";
import { Repository } from "typeorm";
import { AdminSettingsDto } from "@tk-postral/payment-common";

@Injectable()
export class AdminSettingsService {
    // This service will be used to manage admin settings related to payments, such as commission rates, fee structures, etc.
    // For now, it's just a placeholder and can be implemented with actual logic as needed.

    /**
     *
     */
    constructor(@InjectRepository(AdminSettings) private adminSettingsRepository: Repository<AdminSettings>) { }

    // İlk kaydı düzenler ya da yoksa yeni oluşturur
    async upsertAdminSettings(settings: Partial<AdminSettingsDto>): Promise<AdminSettingsDto> {
        let existingSettingsLs = await this.adminSettingsRepository.find();
        const existingSettings = existingSettingsLs.length > 0 ? existingSettingsLs[0] : null;
        if (existingSettings) {
            // Güncelleme işlemi
            this.updateFromDto(existingSettings, settings as AdminSettingsDto);
            await this.adminSettingsRepository.save(existingSettings);
            return this.toDto(existingSettings);
        } else {
            // Yeni kayıt oluşturma
            const newSettings = new AdminSettings();
            this.updateFromDto(newSettings, settings as AdminSettingsDto);
            await this.adminSettingsRepository.save(newSettings);
            return this.toDto(newSettings);
        }
    }

    async getAdminSettings(): Promise<AdminSettingsDto> {
        let existingSettingsLs = await this.adminSettingsRepository.find();
        const existingSettings = existingSettingsLs.length > 0 ? existingSettingsLs[0] : null;
        if (!existingSettings) {
            // Eğer ayarlar yoksa, varsayılan bir kayıt oluşturabiliriz
            return await this.upsertAdminSettings({
                sellerPaysPaymentServiceFee: false,
                comissionsCalculatedFromNet: false
            });
        }
        return this.toDto(existingSettings);
    }

    toDto(settings: AdminSettings) {
        const dto = new AdminSettingsDto();
        dto.id = settings.id;
        dto.sellerPaysPaymentServiceFee = settings.sellerPaysPaymentServiceFee;
        dto.comissionsCalculatedFromNet = settings.comissionsCalculatedFromNet;
        dto.createdAt = settings.createdAt;
        dto.updatedAt = settings.updatedAt;
        dto.reportQueryId = settings.reportQueryId;
        dto.comissionItemTaxId = settings.comissionItemTaxId;
        return dto;
    }

    updateFromDto(settings: AdminSettings, dto: AdminSettingsDto) {
        settings.sellerPaysPaymentServiceFee = dto.sellerPaysPaymentServiceFee;
        settings.comissionsCalculatedFromNet = dto.comissionsCalculatedFromNet;
        settings.reportQueryId = dto.reportQueryId;
        settings.comissionItemTaxId = dto.comissionItemTaxId;
    }


}