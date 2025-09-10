import {
    Controller,
    Get,
    Post,
    Put,
    Delete,
    Param,
    Body,
    UseGuards,
} from '@nestjs/common';
import { AccountService } from '../service/account.service';
import { AccountDTO } from '@tk-postral/payment-common';
import { JwtAuthGuard } from '@ubs-platform/users-microservice-helper';

@Controller('current-user/account')
@UseGuards(JwtAuthGuard)
export class AccountController {
    constructor(private readonly accountService: AccountService) {}

    @Get()
    async findAll(): Promise<AccountDTO[]> {
        // admin ise tümü, değilse kendi oluşturdukları vs
        return this.accountService.fetchAll();
    }

    @Get(':id')
    async findOne(@Param('id') id: string): Promise<AccountDTO> {
        // admin ise tümü, değilse kendi oluşturdukları vs
        return this.accountService.fetchOne(id);
    }

    @Post()
    async create(@Body() account: AccountDTO): Promise<AccountDTO> {
        return await this.accountService.add(account);
    }

    @Put()
    async update(@Body() account: AccountDTO): Promise<AccountDTO> {
        return await this.accountService.edit(account);
    }

    @Delete(':id')
    async remove(@Param('id') id: string): Promise<void> {
        await this.accountService.delete(id);
    }
}
