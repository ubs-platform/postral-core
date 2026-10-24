import { ReportExpenseDTO } from "./report-expense.dto";
import { ReportTaxGroupDTO } from "./report-tax-group.dto";
import { ReportDTO } from "./report.dto";
import { ReportItemDTO } from "./report-item.dto";
import { ReportPlatformDTO } from "./report-platform.dto";

export class ReportFullDTO extends ReportDTO {
    taxGroups: ReportTaxGroupDTO[] = [];
    expenses: ReportExpenseDTO[] = [];
    items: ReportItemDTO[] = [];
    platforms: ReportPlatformDTO[] = [];
}