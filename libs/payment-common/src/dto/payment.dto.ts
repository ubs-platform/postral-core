import { PaymentItemDto } from './payment-item.dto';

export interface PaymentDTO {
    id: string;

    type: 'PURCHASE' | 'REFUND';

    /**
     * Ödeme tutarı (vergiler dahil)
     */
    totalAmount: number;
    taxAmount: number;
    customerAccountId: string;

    /**
     * Euro (€ or EUR), US Dollars($ or USD), Turkish Lira (₺ or TRY), etc...
     */
    paymentOperationId?: string;
    paymentOperationRedirectUrl?: string;
    status: 'INITIATED' | 'COMPLETED' | 'WAITING' | 'EXPIRED';
    currency: string;
}
