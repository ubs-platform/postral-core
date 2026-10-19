import { Injectable } from '@nestjs/common';
import { Payment } from '@tk-postral/postral-entities';
import { PaymentDTO, PaymentFullDTO } from '@tk-postral/payment-common';
import { PaymentItemMapper } from './payment-item.mapper';
import { PaymentTaxMapper } from './payment-tax.mapper';
import { InvoiceAddressMapper } from './invoice-address.mapper';
import { InvoiceAccountMapper } from './invoice-account.mapper';

@Injectable()
export class PaymentMapper {

    /**
     *
     */
    constructor(
        private paymentTaxMapper: PaymentTaxMapper,
        private paymentItemMapper: PaymentItemMapper,
        private snapshotAddressMapper: InvoiceAddressMapper,
        private snapshotAccountMapper: InvoiceAccountMapper) {

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
            billingAddressId: saved.billingAddressId,
            paymentChannelId: saved.paymentChannelId,
            paymentStatus: saved.paymentStatus,
            errorStatus: saved.errorStatus,
            createdAt: saved.createdAt,
            updatedAt: saved.updatedAt,
            includeInReportDigestion: saved.includeInReportDigestion,
            openPayment: saved.openPayment,
            externalPlatformId: saved.externalPlatformId,
            externalPlatformOrderId: saved.externalPlatformOrderId,
            activeSessionId: saved.activeSessionId,
            failOnPaymentChannelFailure: saved.failOnPaymentChannelFailure,
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
            billingAddressId: saved.billingAddressId,
            paymentChannelId: saved.paymentChannelId,
            paymentStatus: saved.paymentStatus,
            errorStatus: saved.errorStatus,
            createdAt: saved.createdAt,
            updatedAt: saved.updatedAt,
            items: this.paymentItemMapper.toDto(saved.items),
            taxes: this.paymentTaxMapper.toDto(saved.taxes),
            customerSnapshotAccountId: saved.customerSnapshotAccountId,
            customerSnapshotAddressId: saved.customerSnapshotAddressId,
            customerSnapshotAccount: saved.customerSnapshotAccount ? this.snapshotAccountMapper.toDto(saved.customerSnapshotAccount) : undefined,
            customerSnapshotAddress: saved.customerSnapshotAddress ? this.snapshotAddressMapper.toDto(saved.customerSnapshotAddress) : undefined,
            includeInReportDigestion: saved.includeInReportDigestion,
            openPayment: saved.openPayment,
            externalPlatformId: saved.externalPlatformId,
            externalPlatformOrderId: saved.externalPlatformOrderId,
            activeSessionId: saved.activeSessionId,
            failOnPaymentChannelFailure: saved.failOnPaymentChannelFailure,
        };
    }
}
