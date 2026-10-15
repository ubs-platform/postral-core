import { Injectable } from "@nestjs/common";
import { ReportDTO, ReportFullDTO } from "@tk-postral/payment-common";
import { Report, ReportExpense, ReportTaxGroup } from '@tk-postral/postral-entities';
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
        dto.reportType = entity.reportType;
        dto.accountId = entity.query?.ownerAccountId;
        dto.accountName = entity.query?.account?.name;
        // dto.ownerAccountName = entity.query.ownerAccountId
        return dto;
    }

    toFullDto(entity: Report, taxReports: ReportTaxGroup[], expenses: ReportExpense[], reportItems: any[]): ReportFullDTO {  // Replace 'any' with the correct type for report items if available
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
        fullDto.items = reportItems.map(
            a => {
                return {
                    id: a.id,
                    reportId: a.reportId,
                    reportItemKey: a.reportItemKey,
                    accountId: a.accountId,
                    itemId: a.itemId,
                    itemName: a.itemName,
                    itemVariation: a.itemVariation,
                    itemQuantity: a.itemQuantity,
                    itemTotalAmount: a.itemTotalAmount,
                    itemTaxAmount: a.itemTaxAmount,
                    itemDiscountAmount: a.itemDiscountAmount,
                    itemComissionAmount: a.itemComissionAmount,
                    purchasedComissionAmount: a.purchasedComissionAmount,
                    purchasedQuantity: a.purchasedQuantity,
                    purchasedTotalAmount: a.purchasedTotalAmount,
                    purchasedTaxAmount: a.purchasedTaxAmount,
                    purchasedDiscountAmount: a.purchasedDiscountAmount,
                    refundedQuantity: a.refundedQuantity,
                    refundedTotalAmount: a.refundedTotalAmount,
                    refundedTaxAmount: a.refundedTaxAmount,
                    refundedDiscountAmount: a.refundedDiscountAmount,
                    refundedComissionAmount: a.refundedComissionAmount,
                    updatedAt: a.updatedAt,
                    createdAt: a.createdAt,
                }
            }
        )

        return fullDto;
    }
}