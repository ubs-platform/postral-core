import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import { PaymentSearchService } from '../service/payment-search.service';
import { PaymentSearchPaginationFlatDTO } from '@tk-postral/payment-common';
import { UserAuthBackendDTO } from '@ubs-platform/users-common';
import { CurrentUser, UserIntercept } from '@ubs-platform/users-microservice-helper';

@Controller('payment')
export class PaymentSearchController {
    constructor(private pss: PaymentSearchService) {}

    @Get()
    public async fetchAll(
        @Query() search: PaymentSearchPaginationFlatDTO,
        @CurrentUser() user?: UserAuthBackendDTO,
    ) {
        return await this.pss.findAll(search, user);
    }

    @Get('/_search')
    @UseGuards(UserIntercept)
    public async searchAll(
        @Query() search: PaymentSearchPaginationFlatDTO,
        @CurrentUser() user?: UserAuthBackendDTO,
    ) {
        return await this.pss.modelSearch(search, user);
    }
}
