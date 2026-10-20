import { Body, Controller, Get, Param, Post, Query, UseGuards } from '@nestjs/common';
import { JwtAuthGuard, CurrentUser } from '@ubs-platform/users-microservice-helper';
import { UserAuthBackendDTO } from '@ubs-platform/users-common';
import { SellerReportSetupDTO } from '@tk-postral/payment-common';
import { SellerReportSetupService } from '../service/seller-report-setup.service';

@Controller('account/:accountId/report-setup')
@UseGuards(JwtAuthGuard)
export class SellerReportSetupController {
    constructor(private readonly service: SellerReportSetupService) {}

    @Get()
    preview(@Param('accountId') accountId: string, @Query('currency') currency: string, @CurrentUser() user: UserAuthBackendDTO) {
        return this.service.preview(accountId, currency, user);
    }

    @Post()
    setup(@Param('accountId') accountId: string, @Body() input: SellerReportSetupDTO, @CurrentUser() user: UserAuthBackendDTO) {
        return this.service.setup(accountId, input, user);
    }
}
