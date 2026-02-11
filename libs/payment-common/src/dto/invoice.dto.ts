
export interface InvoiceDTO {
    id: string;
    paymentId?: string;
    transactionId?: string;
    filePath: string;
    originalFileName: string;
    fileSize: number;
    mimeType: string;
    invoiceNumber?: string;
    invoiceDate?: Date;
    status: string;
    uploadedByUserId?: string;
    notes?: string;
    createdAt: Date;
    updatedAt: Date;
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
}

export interface InvoiceUpdateDTO {
    invoiceNumber?: string;
    invoiceDate?: Date;
    status?: string;
    notes?: string;
}