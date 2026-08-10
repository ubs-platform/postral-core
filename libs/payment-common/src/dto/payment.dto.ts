import { PaymentErrorStatus, PaymentStatus } from '../type/status';
import { PaymentCaptureInfoDTO } from './capture-info.dto';
import { SnapshotAccountDTO } from './invoice-account.dto';
import { SnapshotAddressDTO } from './invoice-address.dto';
import { PaymentItemDTO } from './payment-item.dto';
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
    customerAccountName?: string;
    billingAddressId?: string;
    paymentChannelId: string;
    paymentChannelOperationId?: string;
    paymentChannelOperationUrl?: string;
    paymentStatus: PaymentStatus;
    errorStatus: PaymentErrorStatus;

    /**
     * Euro (€ or EUR), US Dollars($ or USD), Turkish Lira (₺ or TRY), etc...
     */
    currency: string;
    createdAt?: Date | string;
    updatedAt?: Date | string;
    includeInReportDigestion?: boolean;
    openPayment?: boolean;
    externalPlatformId?: string;
    externalPlatformOrderId?: string;
    activeSessionId?: string;
    failOnPaymentChannelFailure?: boolean;
    customerSnapshotAccountId?: string;
    customerSnapshotAddressId?: string;
}

export interface PaymentFullWithCaptureInfoDTO extends PaymentDTO {
    items: PaymentItemDTO[];
    taxes: TaxDTO[];
    customerSnapshotAccount?: SnapshotAccountDTO;
    customerSnapshotAddress?: SnapshotAddressDTO;
    captureInfo: PaymentCaptureInfoDTO;
}

export interface PaymentFullDTO extends PaymentDTO {
    items: PaymentItemDTO[];
    taxes: TaxDTO[];
    customerSnapshotAccount?: SnapshotAccountDTO;
    customerSnapshotAddress?: SnapshotAddressDTO;

}