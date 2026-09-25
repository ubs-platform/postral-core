import { SearchRequest } from '@ubs-platform/crud-base-common';
import { SnapshotAddressDTO } from './invoice-address.dto';
import { SnapshotAccountDTO } from './invoice-account.dto';

export class InvoiceDTO {
    id: string;
    paymentId: string;
    sellerPaymentOrderId: string;
    invoiceNumber?: string;
    invoiceDate?: Date;
    status: string;
    uploadedByUserId?: string;
    notes?: string;
    createdAt: Date;
    updatedAt: Date;
    sellerInvoiceAddress?: SnapshotAddressDTO;
    sellerInvoiceAccount?: SnapshotAccountDTO;
    customerInvoiceAddress?: SnapshotAddressDTO;
    customerAccount?: SnapshotAccountDTO;
    finalized: boolean;
}

export class InvoiceCreateDTO {
    paymentId: string;
    sellerPaymentOrderId: string;
    filePath: string;
    originalFileName: string;
    fileSize: number;
    mimeType: string;
    invoiceNumber?: string;
    invoiceDate?: Date;
    uploadedByUserId?: string;
    notes?: string;
    sellerInvoiceAddress?: SnapshotAddressDTO;
    sellerInvoiceAccount?: SnapshotAccountDTO;
    customerInvoiceAddress?: SnapshotAddressDTO;
    customerAccount?: SnapshotAccountDTO;
}

export class InvoiceUpdateDTO {
    invoiceNumber?: string;
    invoiceDate?: Date;
    status?: string;
    notes?: string;
}

export class InvoiceSearchDTO {
    paymentId?: string;
    sellerPaymentOrderId?: string;
    invoiceNumber?: string;
    status?: string;
    uploadedByUserId?: string;
    dateFrom?: Date;
    dateTo?: Date;
    finalized?: 'true' | 'false' | boolean | undefined;
}

export class InvoiceSearchPaginationDTO
    extends SearchRequest,
        InvoiceSearchDTO {}
