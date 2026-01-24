import { PaymentErrorStatus, PaymentStatus } from '../type/status';
import { PaymentCaptureInfoDTO } from './capture-info.dto';
import { PaymentItemDto } from './payment-item.dto';
import { TaxDTO } from './tax.dto';

export interface PaymentDTO {
    id: string;

    type: 'PURCHASE' | 'REFUND';

    /**
     * Ödeme tutarı (vergiler dahil)
     */
    totalAmount: number;
    taxAmount: number;
    customerAccountId: string;

    paymentChannelId: string;
    paymentChannelOperationId?: string;
    paymentChannelOperationUrl?: string;
    paymentStatus: PaymentStatus;
    errorStatus: PaymentErrorStatus;
    
    /**
     * Euro (€ or EUR), US Dollars($ or USD), Turkish Lira (₺ or TRY), etc...
     */
    currency: string;
}

export interface PaymentFullWithCaptureInfoDTO extends PaymentDTO {
    items: PaymentItemDto[];
    taxes: TaxDTO[];
    captureInfo: PaymentCaptureInfoDTO;
}

export interface PaymentFullDTO extends PaymentDTO {
    items: PaymentItemDto[];
    taxes: TaxDTO[];
}