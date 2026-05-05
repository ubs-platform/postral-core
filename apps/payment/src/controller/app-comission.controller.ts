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
    UseGuards,
} from '@nestjs/common';
import { AccountService } from '../service/account.service';
import { AccountDTO } from '@tk-postral/payment-common';
import { AppComissionService } from '../service/app-commission.service';
import { AppComissionDTO } from '@tk-postral/payment-common/dto/app-comission.dto';
import { JwtAuthGuard, } from '@ubs-platform/users-microservice-helper';
import { Roles, RolesGuard } from '@ubs-platform/users-roles';
import { SearchRequest, SearchResult } from '@ubs-platform/crud-base-common';

@Controller('app-comission')
export class AppComissionController {
    constructor(private readonly accountService: AppComissionService) { }


    @Get("_search")
    async findAllSearch(@Query() searchReq: SearchRequest): Promise<SearchResult<AppComissionDTO>> {
        return await this.accountService.fetchAll(searchReq);
    }

    @Put()
    @UseGuards(JwtAuthGuard, RolesGuard)
    @Roles(['admin', 'postral-admin'])
    async update(@Body() comissionWork: AppComissionDTO): Promise<AppComissionDTO> {
        return await this.accountService.editOrCreate(comissionWork);
    }

    @Delete(":id")
    @UseGuards(JwtAuthGuard, RolesGuard)
    @Roles(['admin', 'postral-admin'])
    async delete(@Param("id") id: string) {
        await this.accountService.removeById(id);
    }
}

// Gelen komisyonları raporlamak için yapılacaklar:
// 1 - Admin sayfasında komisyonlar için hangi raporlama sorgusu kullanılacağı seçilir. 
// Raporlama sorgusu DAILY (Günlük) olmalıdır. Yoksa gün gün hesaplamalar yapılamaz ve daha 
// kod bakımı daha meşakatli olur. 
// (Raporlama sorgusu, rapor digestion tarafından kullanılacak ve rapor digestion, 
// komisyonları hesaplamak için bu sorguyu kullanacak)

// 2 - Admin sayfasında komisyonlar için ayın kaçıncı günlerinde faturalandırma yapılacağı seçilir. (Örn: 1, 15, 30 gibi)
// 3 - Admin sayfasında % kaçlık vergi uygulanacağı seçilir. (Ürünlerde kullanılan tax entitysi kulanılacak)
// Ürün satışı oldukça rapor report-digestion'da hesaplanacak ve kaydedilecek.



// 4 - Komisyonlar seçilen uzunlukta faturalandırılır, ve report digestion aracılığıyla raporlanır.
// 4.1 - Komisyon, ürün gibi eklenecek. Vergisi