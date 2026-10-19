import {
    Controller,
    Get,
    Put,
    Delete,
    Param,
    Body,
    Query,
    UseGuards,
} from '@nestjs/common';
import { ExternalPlatformService } from '../service/external-platform.service';
import { ExternalPlatformDTO } from '@tk-postral/payment-common';
import { JwtAuthGuard } from '@ubs-platform/users-microservice-helper';
import { Roles, RolesGuard } from '@ubs-platform/users-roles';
import { SearchRequest, SearchResult } from '@ubs-platform/crud-base-common';

@Controller('external-platform')
export class ExternalPlatformController {
    constructor(private readonly externalPlatformService: ExternalPlatformService) { }

    @Get('_search')
    async findAllSearch(@Query() searchReq: SearchRequest): Promise<SearchResult<ExternalPlatformDTO>> {
        return await this.externalPlatformService.fetchAll(searchReq);
    }

    @Put()
    @UseGuards(JwtAuthGuard, RolesGuard)
    @Roles(['ADMIN', 'POSTRAL-ADMIN'])
    async update(@Body() dto: ExternalPlatformDTO): Promise<ExternalPlatformDTO> {
        return await this.externalPlatformService.editOrCreate(dto);
    }

    @Delete(':id')
    @UseGuards(JwtAuthGuard, RolesGuard)
    @Roles(['ADMIN', 'POSTRAL-ADMIN'])
    async delete(@Param('id') id: string) {
        await this.externalPlatformService.removeById(id);
    }
}
