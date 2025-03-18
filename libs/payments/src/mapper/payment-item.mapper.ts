import { Injectable } from '@nestjs/common';
import { PaymentItemDto as PostralPaymentItemDto } from '../dto/payment-item.dto';
import { PostralPaymentItem } from '../entity/payment-item.entity';

@Injectable()
export class PaymentItemMapper {
    toDto(items: PostralPaymentItem[]): PostralPaymentItemDto[] {
        const dtos: PostralPaymentItemDto[] = [];
        for (let index = 0; index < items.length; index++) {
            const a = items[index];
            dtos.push({
                id: a.id,
                name: a.name,
                quantity: a.quantity,
                totalAmount: a.totalAmount,
                taxedAmount: 10,
                taxPercent: 10,
            });
        }
        return dtos;
    }
}
