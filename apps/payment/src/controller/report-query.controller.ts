import {
    Body,
    Controller,
    Delete,
    Get,
    Param,
    Post,
    Put,
    Query,
} from '@nestjs/common';
import { ReportQueryService } from '../service/report-query.service';
import { ReportService } from '../service/report.service';
import { ReportQueryCreateDTO, ReportQuerySearchDTO } from '@tk-postral/payment-common';

@Controller('report-query')
export class ReportQueryController {
    constructor(
        private readonly reportQueryService: ReportQueryService,
        private readonly reportService: ReportService,
    ) {}

    @Post()
    async create(@Body() dto: ReportQueryCreateDTO) {
        return this.reportQueryService.create(dto);
    }

    @Get()
    async findAll(@Query() search: ReportQuerySearchDTO) {
        return this.reportQueryService.findAll(search);
    }

    @Get('/:id')
    async findById(@Param('id') id: string) {
        return this.reportQueryService.findById(id);
    }

    @Put('/:id')
    async update(@Param('id') id: string, @Body() dto: ReportQueryCreateDTO) {
        return this.reportQueryService.update(id, dto);
    }

    @Delete('/:id')
    async remove(@Param('id') id: string) {
        await this.reportQueryService.remove(id);
    }

    @Get('/:id/reports')
    async getReports(@Param('id') id: string) {
        return this.reportService.findByQueryId(id);
    }
}
