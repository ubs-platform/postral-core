import { Injectable } from "@nestjs/common";
import { ReportDTO, ReportFullDTO } from "@tk-postral/payment-common";
import { Report } from "../entity/report.entity";
import { ReportExpense, ReportTaxGroup } from "../entity";
@Injectable()
export class ReportMapper {

    toDto(entity: Report): ReportDTO {
        const dto = new ReportDTO();
        dto.id = entity.id;
        dto.queryId = entity.queryId;
        dto.periodLabel = entity.periodLabel;
        dto.currency = entity.currency;
        dto.netRevenue = entity.netRevenue;
        dto.totalSaleAmount = entity.totalSaleAmount;
        dto.totalRefundAmount = entity.totalRefundAmount;
        dto.totalSaleTaxAmount = entity.totalSaleTaxAmount;
        dto.totalRefundTaxAmount = entity.totalRefundTaxAmount;
        dto.netTaxAmount = entity.netTaxAmount;
        dto.netSaleAmount = entity.netSaleAmount;
        dto.paymentCount = entity.paymentCount;
        dto.lastDigestedAt = entity.lastDigestedAt;
        dto.createdAt = entity.createdAt;
        dto.archived = entity.archived;
        dto.totalExpense = entity.totalExpense;
        dto.netRevenueWithoutExpense = entity.netRevenueWithoutExpense;
        return dto;
    }

    toFullDto(entity: Report, taxReports: ReportTaxGroup[], expenses: ReportExpense[]): ReportFullDTO {
        const fullDto = new ReportFullDTO();
        const plainDto = this.toDto(entity);
        Object.assign(fullDto, plainDto);
        fullDto.taxGroups = taxReports.map(tg => {
            return {
                taxGroupName: tg.taxGroupName,
                taxPercent: parseFloat(tg.taxPercent),
                paymentCount: tg.paymentCount,
                totalSaleAmountWithoutExpense: tg.totalSaleAmountWithoutExpense,
                totalExpenseAmount: tg.totalExpenseAmount,
                totalSaleAmount: tg.totalSaleAmount,
                totalRefundAmount: tg.totalRefundAmount,
                totalSaleTaxAmount: tg.totalSaleTaxAmount,
                totalRefundTaxAmount: tg.totalRefundTaxAmount,
                netTaxAmount: tg.netTaxAmount,
                netSaleAmount: tg.netSaleAmount,
                netRevenue: tg.netRevenue,
            }
        }) || [];

        fullDto.expenses = expenses || [];

        return fullDto;
    }
}