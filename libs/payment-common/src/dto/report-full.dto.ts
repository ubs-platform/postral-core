import { ReportExpenseDTO } from "./report-expense.dto";
import { ReportTaxGroupDTO } from "./report-tax-group.dto";
import { ReportDTO } from "./report.dto";

export class ReportFullDTO extends ReportDTO {
    taxGroups: ReportTaxGroupDTO[] = [];
    expenses: ReportExpenseDTO[] = [];
}