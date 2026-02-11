import { Injectable } from '@nestjs/common';
import { Invoice } from '../entity/invoice.entity';
import { InvoiceCreateDTO, InvoiceDTO } from '@tk-postral/payment-common';


@Injectable()
export class InvoiceMapper {
    toDto(entity: Invoice): InvoiceDTO {
        return {
            id: entity.id,
            paymentId: entity.paymentId,
            transactionId: entity.transactionId,
            filePath: entity.filePath,
            originalFileName: entity.originalFileName,
            fileSize: entity.fileSize,
            mimeType: entity.mimeType,
            invoiceNumber: entity.invoiceNumber,
            invoiceDate: entity.invoiceDate,
            status: entity.status,
            uploadedByUserId: entity.uploadedByUserId,
            notes: entity.notes,
            createdAt: entity.createdAt,
            updatedAt: entity.updatedAt,
        };
    }

    toEntity(dto: InvoiceCreateDTO): Invoice {
        const entity = new Invoice();
        entity.paymentId = dto.paymentId;
        entity.transactionId = dto.transactionId;
        entity.filePath = dto.filePath;
        entity.originalFileName = dto.originalFileName;
        entity.fileSize = dto.fileSize;
        entity.mimeType = dto.mimeType;
        entity.invoiceNumber = dto.invoiceNumber || "";
        entity.invoiceDate = dto.invoiceDate || new Date();
        entity.uploadedByUserId = dto.uploadedByUserId || "";
        entity.notes = dto.notes || "";
        entity.status = 'UPLOADED';
        return entity;
    }
}
