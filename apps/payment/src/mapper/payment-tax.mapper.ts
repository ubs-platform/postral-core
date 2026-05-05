import { Injectable } from '@nestjs/common';
import { PaymentItemDto, TaxDTO } from '@tk-postral/payment-common';
import { PostralPaymentItem, PostralPaymentTax } from '@tk-postral/postral-entities';

@Injectable()
export class PaymentTaxMapper {
    toEntity(dto: TaxDTO): PostralPaymentTax {
        const ppt = new PostralPaymentTax();
        ppt.fullAmount = dto.fullAmount;
        ppt.percent = dto.percent;
        ppt.taxAmount = dto.taxAmount;
        ppt.untaxAmount = dto.untaxAmount;
        return ppt;
    }

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
