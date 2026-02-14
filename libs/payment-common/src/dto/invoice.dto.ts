import { SearchRequest } from '@ubs-platform/crud-base-common';
import { InvoiceAccountDTO } from './account.dto';
import { InvoiceAddressDto } from './invoice-address.dto';

export interface InvoiceDTO {
    id: string;
    paymentId: string;
    transactionId: string;
    invoiceNumber?: string;
    invoiceDate?: Date;
    status: string;
    uploadedByUserId?: string;
    notes?: string;
    createdAt: Date;
    updatedAt: Date;
    sellerInvoiceAddress?: InvoiceAddressDto;
    sellerInvoiceAccount?: InvoiceAccountDTO;
    customerInvoiceAddress?: InvoiceAddressDto;
    customerAccount?: InvoiceAccountDTO;
}

export interface InvoiceCreateDTO {
    paymentId: string;
    transactionId: string;
    filePath: string;
    originalFileName: string;
    fileSize: number;
    mimeType: string;
    invoiceNumber?: string;
    invoiceDate?: Date;
    uploadedByUserId?: string;
    notes?: string;
    sellerInvoiceAddress?: InvoiceAddressDto;
    sellerInvoiceAccount?: InvoiceAccountDTO;
    customerInvoiceAddress?: InvoiceAddressDto;
    customerAccount?: InvoiceAccountDTO;
}

export interface InvoiceUpdateDTO {
    invoiceNumber?: string;
    invoiceDate?: Date;
    status?: string;
    notes?: string;
}


export interface InvoiceSearchDTO {
    paymentId?: string;
    transactionId?: string;
    invoiceNumber?: string;
    status?: string;
    uploadedByUserId?: string;
    dateFrom?: Date;
    dateTo?: Date;
    finalized?: "true" | "false" | boolean | undefined;
}

export interface InvoiceSearchPaginationDTO extends SearchRequest, InvoiceSearchDTO {
}
