import { Injectable } from '@nestjs/common';
import { PaymentItemDto, TaxDTO } from '@tk-postral/payment-common';
import { PostralPaymentItem, PostralPaymentTax } from '@tk-postral/postral-entities';
import * as BigJs from 'big.js';

@Injectable()
export class PaymentTaxMapper {
    toEntity(dto: TaxDTO): PostralPaymentTax {
        const ppt = new PostralPaymentTax();
        ppt.fullAmount = new BigJs.Big(dto.fullAmount || 0);
        ppt.percent = new BigJs.Big(dto.percent || 0);
        ppt.taxAmount = new BigJs.Big(dto.taxAmount || 0);
        ppt.untaxAmount = new BigJs.Big(dto.untaxAmount || 0);
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
