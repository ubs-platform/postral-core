import { Injectable } from '@nestjs/common';
import { PaymentItemDto } from '@tk-postral/payment-common';
import { PostralPaymentItem } from '../entity/payment-item.entity';
import { exec } from 'child_process';

@Injectable()
export class PaymentItemMapper {
    toEntity(dto: PaymentItemDto): PostralPaymentItem {
        // if (dto.appComissionAmount == 0) {
        //     exec(`kdialog --msgbox "PaymentItemMapper toEntity appComissionAmount is 0 for itemId: ${dto.itemId}, name: ${dto.name}"`);
        //     debugger
        // }
        const pi = new PostralPaymentItem();
        pi.itemId = dto.itemId;
        pi.name = dto.name;
        pi.quantity = dto.quantity;
        pi.unitAmount = dto.unitAmount;
        pi.originalUnitAmount = dto.originalUnitAmount;
        pi.totalAmount = dto.totalAmount;
        pi.taxPercent = dto.taxPercent;
        pi.taxAmount = dto.taxAmount;
        pi.unTaxAmount = dto.unTaxAmount;
        pi.variation = dto.variation;
        pi.entityGroup = dto.entityGroup;
        pi.entityId = dto.entityId;
        pi.entityName = dto.entityName;
        pi.sellerAccountId = dto.sellerAccountId;
        // pi.sellerAccountName = dto.sellerAccountName;
        pi.itemClass = dto.itemClass || "";
        pi.unit = dto.unit;
        pi.appComissionAmount = dto.appComissionAmount || 0;
        pi.appComissionPercent = dto.appComissionPercent || 0;
        return pi;
    }

    toDto(items: PostralPaymentItem[]): PaymentItemDto[] {
        const dtos: PaymentItemDto[] = [];
        for (let index = 0; index < items.length; index++) {
            const a = items[index];
            dtos.push({
                id: a.id,
                itemId: a.itemId,
                name: a.name,
                quantity: a.quantity,
                totalAmount: a.totalAmount,
                taxAmount: a.taxAmount,
                taxPercent: a.taxPercent,
                variation: a.variation,
                sellerAccountId: a.sellerAccountId,
                sellerAccountName: a.sellerAccountName,
                entityGroup: a.entityGroup!,
                entityId: a.entityId!,
                entityName: a.entityName!,
                itemClass: a.itemClass || "",
                unTaxAmount: a.unTaxAmount,
                originalUnitAmount: a.originalUnitAmount,
                unitAmount: a.unitAmount,
                unit: a.unit,
                refundCount: a.refundCount,
                appComissionAmount: a.appComissionAmount,
                appComissionPercent: a.appComissionPercent,
            });
        }
        return dtos;
    }
}
