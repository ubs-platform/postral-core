import { Controller, Get, Param, UseGuards } from '@nestjs/common';
import { ReportQueryCrudService } from '../service/report-query.service';
import { ReportService } from '../service/report.service';
import { ReportQueryDTO, ReportQuerySearchDTO } from '@tk-postral/payment-common';
import { BaseCrudControllerGenerator } from '@ubs-platform/crud-base';
import { ReportQuery } from '../entity/report-query.entity';
import { JwtAuthGuard } from '@ubs-platform/users-microservice-helper';

@Controller('report-query')
export class ReportQueryController extends BaseCrudControllerGenerator<
    ReportQuery,
    string,
    ReportQueryDTO,
    ReportQueryDTO,
    ReportQuerySearchDTO
>({
    authorization: {
        ALL: { needsAuthenticated: true },
    },
}) {
    constructor(
        protected readonly service: ReportQueryCrudService,
        private readonly reportService: ReportService,
    ) {
        super(service);
    }

    @Get(':id/reports')
    @UseGuards(JwtAuthGuard)
    async getReports(@Param('id') id: string) {
        return this.reportService.findByQueryId(id);
    }
}
