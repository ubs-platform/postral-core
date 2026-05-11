import {
    Body,
    Controller,
    Delete,
    Get,
    Param,
    Put,
    Query,
    UseGuards,
} from '@nestjs/common';
import { PaymentChannelConfigService } from '../service/payment-channel-config.service';
import { PaymentChannelConfigDTO } from '@tk-postral/payment-common';
import { JwtAuthGuard } from '@ubs-platform/users-microservice-helper';
import { Roles, RolesGuard } from '@ubs-platform/users-roles';
import { SearchRequest, SearchResult } from '@ubs-platform/crud-base-common';

@Controller('payment-channel-config')
export class PaymentChannelConfigController {
    constructor(private readonly service: PaymentChannelConfigService) {}

    /** Public — checkout ekranı ve diğer servisler kullanabilir.
     *  Production ortamında devOnly=true kanallar otomatik filtrelenir. */
    @Get('_search')
    async findAllSearch(
        @Query() searchReq: SearchRequest,
    ): Promise<SearchResult<PaymentChannelConfigDTO>> {
        const isProduction = process.env.NODE_ENV === 'production';
        return this.service.fetchAll(searchReq, isProduction);
    }

    @Put()
    @UseGuards(JwtAuthGuard, RolesGuard)
    @Roles(['admin', 'postral-admin'])
    async update(@Body() dto: PaymentChannelConfigDTO): Promise<PaymentChannelConfigDTO> {
        return this.service.editOrCreate(dto);
    }

    @Delete(':id')
    @UseGuards(JwtAuthGuard, RolesGuard)
    @Roles(['admin', 'postral-admin'])
    async remove(@Param('id') id: string): Promise<void> {
        await this.service.removeById(id);
    }
}
