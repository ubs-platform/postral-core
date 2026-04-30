import {
    Body,
    Controller,
    Delete,
    Get,
    NotFoundException,
    Param,
    Post,
    Put,
    Query,
    UseGuards,
} from '@nestjs/common';
import { WebhookConfigService } from '../service/webhook-config.service';
import {
    WebhookConfigCreateDTO,
    WebhookConfigUpdateDTO,
} from '@tk-postral/payment-common';
import {
    CurrentUser,
    JwtAuthGuard,
} from '@ubs-platform/users-microservice-helper';
import { UserAuthBackendDTO } from '@ubs-platform/users-common';

@Controller('webhook-config')
@UseGuards(JwtAuthGuard)
export class WebhookConfigController {
    constructor(private readonly webhookConfigService: WebhookConfigService) {}

    @Get()
    async getByAccountId(@Query('accountId') accountId: string) {
        const config = await this.webhookConfigService.findByAccountId(accountId);
        if (!config) {
            throw new NotFoundException(`${accountId} hesabına ait webhook konfigürasyonu bulunamadı`);
        }
        return config;
    }

    @Post()
    async create(@Body() dto: WebhookConfigCreateDTO) {
        return await this.webhookConfigService.create(dto);
    }

    @Put(':id')
    async update(@Param('id') id: string, @Body() dto: WebhookConfigUpdateDTO) {
        return await this.webhookConfigService.update(id, dto);
    }

    @Delete(':id')
    async delete(@Param('id') id: string) {
        await this.webhookConfigService.delete(id);
    }
}
