import { Body, Controller, Post } from "@nestjs/common";
import { ReportService } from "../service/report.service";
import { ReportQueryCrudService } from "../service/report-query.service";
import { ReportReconstructionDTO } from "@tk-postral/payment-common/dto";

@Controller('report')
export class ReportController {
    constructor(protected readonly service: ReportQueryCrudService,
        private readonly reportService: ReportService,) { }

    @Post('reconstruct')
    async reconstructReport(@Body() body: ReportReconstructionDTO) {
        return await this.reportService.reportReconstruct(body);
    }
}