import {
    Controller,
    Get,
    Post,
    Put,
    Delete,
    Param,
    Body,
    Query,
    BadRequestException,
} from '@nestjs/common';
import { AccountService } from '../service/account.service';
import { AccountDTO } from '@tk-postral/payment-common';
import { AppComissionService } from '../service/app-commission.service';
import { AppComissionDTO } from '@tk-postral/payment-common/dto/app-comission.dto';

@Controller('app-comission')
export class AppComissionController {
    constructor(private readonly accountService: AppComissionService) {}

    @Get(':applicationAccountId')
    async fetchOne(
        @Param("applicationAccountId") applicationAccountId: string,
        @Query("seller-account-id") sellerAccountId?: string,
    ): Promise<AppComissionDTO> {
        return await this.accountService.fetchOne(
            applicationAccountId,
            sellerAccountId,
        );
    }

    @Get()
    async findAll(): Promise<AppComissionDTO[]> {
        return await this.accountService.fetchAll();
    }

    @Put()
    async update(@Body() account: AppComissionDTO): Promise<AppComissionDTO> {
        if (account.applicationAccountId == null) {
            throw new BadRequestException("ApplicationAccountId is required")
        }
        return await this.accountService.edit(account);
    }
}
