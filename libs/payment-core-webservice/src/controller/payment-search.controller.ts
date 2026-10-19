import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import { PaymentSearchService } from '../service/payment-search.service';
import { PaymentSearchPaginationFlatDTO, RelatedAccountFilterDto } from '@tk-postral/payment-common';
import { UserAuthBackendDTO } from '@ubs-platform/users-common';
import {
    CurrentUser,
    UserIntercept,
} from '@ubs-platform/users-microservice-helper';
import { PaymentSearchFlatDTO } from '@tk-postral/payment-common';

@Controller('payment')
export class PaymentSearchController {
    constructor(private pss: PaymentSearchService) { }

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

    @Get('/related-accounts')
    @UseGuards(UserIntercept)
    public async fetchRelatedAccounts(
        @CurrentUser() user?: UserAuthBackendDTO,
        @Query() filter?: RelatedAccountFilterDto
    ) {
        return await this.pss.accountIdsInPayment(user, filter);
    }
}
