import { PaymentItemDto } from './payment-item.dto';

export interface PaymentDTO {
    id: string;

    type: 'PURCHASE' | 'REFUND';
    totalAmount: number;

    /**
     * Euro (€ or EUR), US Dollars($ or USD), Turkish Lira (₺ or TRY), etc...
     */
    currency: string;

    // items: PaymentItemDto[];
}
