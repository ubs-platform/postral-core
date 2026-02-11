import { Injectable } from '@nestjs/common';
import { PaymentItemDto } from '@tk-postral/payment-common';
import { PostralPaymentItem } from '../entity/payment-item.entity';

@Injectable()
export class PaymentItemMapper {
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
                entityGroup: a.entityGroup,
                entityId: a.entityId,
                entityName: a.entityName,
                unTaxAmount: a.unTaxAmount,
                originalUnitAmount: a.originalUnitAmount,
                unitAmount: a.unitAmount,
            });
        }
        return dtos;
    }
}
