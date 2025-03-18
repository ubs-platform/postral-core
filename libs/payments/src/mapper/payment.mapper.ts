import { Injectable } from '@nestjs/common';
import { Payment } from '../entity/payment.entity';
import { PaymentDTO } from '../dto/payment.dto';

@Injectable()
export class PaymentMapper {
    toDto(saved: Payment): PaymentDTO {
        return {
            type: saved.type,
            id: saved.id,
            unit: saved.unit,
            totalAmount: saved.totalAmount,
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
