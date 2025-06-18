import { Injectable } from '@nestjs/common';
import { Payment } from '../entity/payment.entity';
import { PaymentDTO } from '@tk-postral/payment-common';

@Injectable()
export class PaymentMapper {
    toDto(saved: Payment): PaymentDTO {
        return {
            type: saved.type,
            id: saved.id,
            currency: saved.currency,
            totalAmount: saved.totalAmount,
            taxAmount: saved.taxAmount,
            //   items: saved.items.map((a) => {
            //     return {
            //       name: a.name,
            //       id: a.id,
            //       totalAmount: a.totalAmount,
            //       quantity: a.quantity,
            //     };
            //   }),
        };
    }
}
