import { Entity, Column, PrimaryGeneratedColumn, OneToMany } from 'typeorm';

import { PaymentItemDto } from './payment-item.dto';
import { PaymentItemInputDto } from './payment-item-input.dto';

export interface PaymentInitDTO {
    // id: string;

    type: 'PURCHASE' | 'REFUND';
    // totalAmount: number;

    /**
     * Euro (€ or EUR), US Dollars($ or USD), Turkish Lira (₺ or TRY), etc...
     */
    currency: string;

    saleMode: string;

    items: PaymentItemInputDto[];

    // refundPaymentId?: string; // Only for REFUND type

    customerAccountId: string;

    refundRequestId?: string; // Only for REFUND type

    activeSessionId?: string; // If a payment has been initiated and not yet completed, the ID of the session associated with this payment is stored here. This prevents a user from initiating multiple payments simultaneously.
    generateActiveSessionId?: boolean; // If true, a new active session ID will be generated for this payment. This is useful for ensuring that each payment initiation is unique and can be tracked separately.
    failOnPaymentChannelFailure?: boolean; // If true, the payment initiation will fail if the selected payment channel encounters an error. This is useful for ensuring that the user is aware of any issues with the payment channel before proceeding.
}

export class PaymentInitDTO implements PaymentInitDTO {
    constructor(partial: Partial<PaymentInitDTO>) {
        Object.assign(this, partial);
    }
}