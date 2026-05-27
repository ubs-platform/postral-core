import { Injectable } from '@nestjs/common';
import { PaymentItemDto } from '@tk-postral/payment-common';
import { PostralPaymentItem } from '@tk-postral/postral-entities';
import { exec } from 'child_process';
import * as BigJs from 'big.js';

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
        pi.unitAmount = new BigJs.Big(dto.unitAmount || 0);
        pi.originalUnitAmount = new BigJs.Big(dto.originalUnitAmount || 0);
        pi.totalAmount = new BigJs.Big(dto.totalAmount || 0);
        pi.taxPercent = new BigJs.Big(dto.taxPercent || 0);
        pi.taxAmount = new BigJs.Big(dto.taxAmount || 0);
        pi.unTaxAmount = new BigJs.Big(dto.unTaxAmount || 0);
        pi.variation = dto.variation;
        pi.entityGroup = dto.entityGroup;
        pi.entityId = dto.entityId;
        pi.entityName = dto.entityName;
        pi.sellerAccountId = dto.sellerAccountId;
        // pi.sellerAccountName = dto.sellerAccountName;
        pi.itemClass = dto.itemClass || "";
        pi.unit = dto.unit;
        pi.appComissionAmount = new BigJs.Big(dto.appComissionAmount || 0);
        pi.appComissionPercent = new BigJs.Big(dto.appComissionPercent || 0);
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
