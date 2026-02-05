import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import { PaymentSearchService } from '../service/payment-search.service';
import { PaymentSearchPaginationFlatDTO, PaymentTransactionSearchPaginationDTO } from '@tk-postral/payment-common';
import { UserAuthBackendDTO } from '@ubs-platform/users-common';
import { CurrentUser, UserIntercept } from '@ubs-platform/users-microservice-helper';
import { PaymentSearchFlatDTO } from '@tk-postral/payment-common';
import { TransactionSearchService } from '../service/transaction-search.service';

@Controller('transaction')
export class TransactionSearchController {
    constructor(private tss: TransactionSearchService) { }
    @Get()
    public async fetchAll(
        @Query() search: PaymentTransactionSearchPaginationDTO,
        @CurrentUser() user?: UserAuthBackendDTO,
    ) {
        return await this.tss.findAll(search, user);
    }

    @Get('/_search')
    @UseGuards(UserIntercept)
    public async searchAll(
        @Query() search: PaymentTransactionSearchPaginationDTO,
        @CurrentUser() user?: UserAuthBackendDTO,
    ) {
        return await this.tss.modelSearch(search, user);
    }

}