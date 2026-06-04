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
import { CurrentUser, JwtAuthGuard, UserIntercept } from '@ubs-platform/users-microservice-helper';
import { Roles, RolesGuard } from '@ubs-platform/users-roles';
import { SearchRequest, SearchResult } from '@ubs-platform/crud-base-common';
import { UserAuthBackendDTO } from '@ubs-platform/users-common';

@Controller('payment-channel-config')
export class PaymentChannelConfigController {
    constructor(private readonly service: PaymentChannelConfigService) {}

    /** Public — checkout ekranı ve diğer servisler kullanabilir.
     *  Production ortamında devOnly=true kanallar otomatik filtrelenir. */
    @Get('_search')
    @UseGuards(UserIntercept, RolesGuard)
    async findAllSearch(
        @Query() searchReq: SearchRequest,
        @CurrentUser() user: UserAuthBackendDTO,
    ): Promise<SearchResult<PaymentChannelConfigDTO>> {
        const isProduction = user?.roles.includes("ADMIN") || user?.roles.includes("POSTRAL-ADMIN") || process.env.NODE_ENV === 'production';
        return this.service.fetchAll(searchReq, isProduction);
    }

    @Put()
    @UseGuards(JwtAuthGuard, RolesGuard)
    @Roles(['ADMIN', 'POSTRAL-ADMIN'])
    async update(@Body() dto: PaymentChannelConfigDTO): Promise<PaymentChannelConfigDTO> {
        return this.service.editOrCreate(dto);
    }

    @Delete(':id')
    @UseGuards(JwtAuthGuard, RolesGuard)
    @Roles(['ADMIN', 'POSTRAL-ADMIN'])
    async remove(@Param('id') id: string): Promise<void> {
        await this.service.removeById(id);
    }
}
