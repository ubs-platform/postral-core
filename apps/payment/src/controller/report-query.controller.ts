import { BadRequestException, Controller, Get, Param, Query, UseGuards } from '@nestjs/common';
import { ReportQueryCrudService } from '../service/report-query.service';
import { ReportService } from '../service/report.service';
import { ReportQueryDTO, ReportQuerySearchDTO } from '@tk-postral/payment-common';
import { BaseCrudController, CrudControllerConfig } from '@ubs-platform/crud-base';
import { ReportQuery } from '../entity/report-query.entity';
import { JwtAuthGuard } from '@ubs-platform/users-microservice-helper';
import { Optional } from '@ubs-platform/crud-base-common/utils';
import { UserAuthBackendDTO } from '@ubs-platform/users-common';

@Controller('report-query')
@CrudControllerConfig({ authorization: { ALL: { needsAuthenticated: true } } })
export class ReportQueryController extends BaseCrudController<
    ReportQuery,
    string,
    ReportQueryDTO,
    ReportQueryDTO,
    ReportQuerySearchDTO
> {
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

    @Get(':id/reports/_search')
    @UseGuards(JwtAuthGuard)
    async searchReports(
        @Param('id') id: string,
        @Query('page') page?: number,
        @Query('size') size?: number,
        @Query('hideArchived') hideArchived?: string,
    ) {
        return this.reportService.searchByQueryId(id, page, size, hideArchived === 'true');
    }

    checkUser(operation: 'ADD' | 'EDIT' | 'REMOVE' | 'GETALL' | 'GETID', user: Optional<UserAuthBackendDTO>, queriesAndPaths: Optional<{ [key: string]: any; }>, body: Optional<ReportQueryDTO>): Promise<void> {
        if (
            (operation === "ADD" || operation === "EDIT") &&
            !user?.roles?.includes('ADMIN') &&
            body?.reportType !== "SELLER") {
            throw new BadRequestException('Only admin can create or edit non-seller report queries');
        }
        return Promise.resolve();
    }
}

