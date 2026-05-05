import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { randomBytes } from 'crypto';
import { WebhookConfig } from '@tk-postral/postral-entities';
import { CryptionUtil } from '../util/cryption-util';
import {
    WebhookConfigCreateDTO,
    WebhookConfigDTO,
    WebhookConfigUpdateDTO,
} from '@tk-postral/payment-common';

@Injectable()
export class WebhookConfigService {
    constructor(
        @InjectRepository(WebhookConfig)
        private readonly webhookConfigRepo: Repository<WebhookConfig>,
        private readonly cryptionUtil: CryptionUtil,
    ) {}

    async create(dto: WebhookConfigCreateDTO): Promise<WebhookConfigDTO> {
        const rawKey = dto.eventKey || randomBytes(32).toString('hex');
        // TODO: eventKey DB'ye yazılmadan önce CryptionUtil.encryptWithConfig ile şifrelenmelidir.
        const encryptedKey = this.cryptionUtil.encryptWithConfig(rawKey, 'USE_DEFAULT') as string;

        const entity = this.webhookConfigRepo.create({
            accountId: dto.accountId,
            url: dto.url,
            method: dto.method ?? 'POST',
            eventKey: encryptedKey,
            isEnabled: true,
        });

        const saved = await this.webhookConfigRepo.save(entity);
        // rawKey yalnızca oluşturma anında döner; sonraki sorgularda maskelenir
        return this.toDto(saved, rawKey);
    }

    async update(id: string, dto: WebhookConfigUpdateDTO): Promise<WebhookConfigDTO> {
        const entity = await this.webhookConfigRepo.findOne({ where: { id } });
        if (!entity) {
            throw new NotFoundException(`WebhookConfig ${id} bulunamadı`);
        }

        if (dto.url !== undefined) entity.url = dto.url;
        if (dto.method !== undefined) entity.method = dto.method;
        if (dto.isEnabled !== undefined) entity.isEnabled = dto.isEnabled;
        if (dto.eventKey !== undefined) {
            // TODO: eventKey DB'ye yazılmadan önce CryptionUtil.encryptWithConfig ile şifrelenmelidir.
            entity.eventKey = this.cryptionUtil.encryptWithConfig(dto.eventKey, 'USE_DEFAULT') as string;
        }

        const saved = await this.webhookConfigRepo.save(entity);
        return this.toDto(saved);
    }

    async delete(id: string): Promise<void> {
        const entity = await this.webhookConfigRepo.findOne({ where: { id } });
        if (!entity) {
            throw new NotFoundException(`WebhookConfig ${id} bulunamadı`);
        }
        await this.webhookConfigRepo.remove(entity);
    }

    async findByAccountId(accountId: string): Promise<WebhookConfigDTO | null> {
        const entity = await this.webhookConfigRepo.findOne({ where: { accountId } });
        if (!entity) return null;
        return this.toDto(entity);
    }

    /** Dispatch servisi için ham entity döner (eventKey şifreli) */
    async findRawByAccountId(accountId: string): Promise<WebhookConfig | null> {
        return this.webhookConfigRepo.findOne({ where: { accountId } });
    }

    private toDto(entity: WebhookConfig, plainKey?: string): WebhookConfigDTO {
        return {
            id: entity.id,
            accountId: entity.accountId,
            url: entity.url,
            method: entity.method,
            // Key yalnızca oluşturma anında açık metin döner; diğer durumlarda maskeli
            eventKey: plainKey ?? '***',
            isEnabled: entity.isEnabled,
            createdAt: entity.createdAt,
            updatedAt: entity.updatedAt,
        };
    }
}
