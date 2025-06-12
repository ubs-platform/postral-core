import {
    Controller,
    Get,
    Post,
    Put,
    Delete,
    Param,
    Body,
    Query,
} from '@nestjs/common';
import { AccountService } from '../service/account.service';
import { AccountDTO } from '@tk-postral/payment-common';
import { AppComissionService } from '../service/app-commission.service';
import { AppComissionDTO } from '@tk-postral/payment-common/dto/app-comission.dto';

@Controller('app-comission')
export class AppComissionController {
    constructor(private readonly accountService: AppComissionService) {}

    @Get()
    async fetchOne(
        @Query() applicationAccountId: string,
        @Query() sellerAccountId?: string,
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
    async update(@Body() account: AppComissionDTO): Promise<void> {
        await this.accountService.edit(account);
    }
}
