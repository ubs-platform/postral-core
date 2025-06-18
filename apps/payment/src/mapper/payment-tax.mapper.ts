import { Injectable } from '@nestjs/common';
import { PaymentItemDto, TaxDTO } from '@tk-postral/payment-common';
import { PostralPaymentItem } from '../entity/payment-item.entity';
import { PostralPaymentTax } from '../entity';

@Injectable()
export class PaymentTaxMapper {
    toDto(items: PostralPaymentTax[]): TaxDTO[] {
        const dtos: TaxDTO[] = [];
        for (let index = 0; index < items.length; index++) {
            const a = items[index];
            dtos.push({
                fullAmount: a.fullAmount,
                percent: a.percent,
                taxAmount: a.taxAmount,
                taxName: a.percent.toString(),
                untaxAmount: a.fullAmount - a.taxAmount,
            });
        }
        return dtos;
    }
}
