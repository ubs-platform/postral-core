import { Injectable } from '@nestjs/common';
import { Payment } from '../entity/payment.entity';
import { PaymentDTO, PaymentFullDTO } from '@tk-postral/payment-common';
import { PaymentItemMapper } from './payment-item.mapper';
import { PaymentTaxMapper } from './payment-tax.mapper';

@Injectable()
export class PaymentMapper {

    /**
     *
     */
    constructor(private paymentTaxMapper: PaymentTaxMapper, private paymentItemMapper: PaymentItemMapper) {

    }

    toDto(saved: Payment): PaymentDTO {

        return {
            type: saved.type,
            id: saved.id,
            currency: saved.currency,
            totalAmount: saved.totalAmount,
            taxAmount: saved.taxAmount,
            customerAccountId: saved.customerAccountId!,
            customerAccountName: saved.customerAccountName!,
            paymentChannelId: saved.paymentChannelId,
            paymentStatus: saved.paymentStatus,
            errorStatus: saved.errorStatus,
            createdAt: saved.createdAt,
            updatedAt: saved.updatedAt,
            includeInReportDigestion: saved.includeInReportDigestion,
            openPayment: saved.openPayment,
        };
    }

    toFullDto(saved: Payment): PaymentFullDTO {

        return {
            type: saved.type,
            id: saved.id,
            currency: saved.currency,
            totalAmount: saved.totalAmount,
            taxAmount: saved.taxAmount,
            customerAccountId: saved.customerAccountId!,
            customerAccountName: saved.customerAccountName!,
            paymentChannelId: saved.paymentChannelId,
            paymentStatus: saved.paymentStatus,
            errorStatus: saved.errorStatus,
            createdAt: saved.createdAt,
            updatedAt: saved.updatedAt,
            items: this.paymentItemMapper.toDto(saved.items),
            taxes: this.paymentTaxMapper.toDto(saved.taxes),
            includeInReportDigestion: saved.includeInReportDigestion,
            openPayment: saved.openPayment,
        };
    }
}
