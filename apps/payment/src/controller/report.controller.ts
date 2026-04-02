import { Body, Controller, Get, Param, Post, Query, UseGuards } from "@nestjs/common";
import { ReportService } from "../service/report.service";
import { ReportQueryCrudService } from "../service/report-query.service";
import { ReportReconstructionDTO } from "@tk-postral/payment-common/dto";
import { ReportSearchDTO, ReportSearchPaginationDTO } from "@tk-postral/payment-common";
import { AuthGuard } from "@nestjs/passport";
import { CurrentUser } from "@ubs-platform/users-microservice-helper";
import { UserAuthBackendDTO } from "@ubs-platform/users-common";

@Controller('report')
export class ReportController {
    constructor(protected readonly service: ReportQueryCrudService,
        private readonly reportService: ReportService,) { }

    @Post('reconstruct')
    async reconstructReport(@Body() body: ReportReconstructionDTO) {
        return await this.reportService.reportReconstruct(body);
    }

    @Post('fetch-in-progress')
    async fetchInProgress(@Body() body: { reportIds: string[] }) {
        return Object.fromEntries(await this.reportService.fetchInProgressReportIds(body.reportIds));
    }

    @Get(':id')
    async getReportById(@Param('id') id: string) {
        return await this.reportService.fetchReportFull(id);
    }

    @Get('_search') 
    @UseGuards(AuthGuard('jwt'))
    async searchReports(@Query() q : ReportSearchPaginationDTO, @CurrentUser() user: UserAuthBackendDTO) {
        return await this.reportService.searchPagination(q, user);
    }
}