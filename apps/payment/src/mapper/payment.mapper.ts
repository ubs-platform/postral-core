import { Injectable } from '@nestjs/common';
import { Payment } from '../entity/payment.entity';
import { PaymentDTO } from '@tk-postral/payment-common';

@Injectable()
export class PaymentMapper {

    /**
     *
     */
    constructor() {
        
    }

    toDto(saved: Payment): PaymentDTO {
        
        return {
            type: saved.type,
            id: saved.id,
            currency: saved.currency,
            totalAmount: saved.totalAmount,
            taxAmount: saved.taxAmount,
            customerAccountId: saved.customerAccountId,
            customerAccountName: saved.customerAccountName,
            paymentChannelId: saved.paymentChannelId,
            paymentStatus: saved.paymentStatus,
            errorStatus: saved.errorStatus,
            createdAt: saved.createdAt,
            updatedAt: saved.updatedAt,

        };
    }
}
