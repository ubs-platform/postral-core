import { Injectable } from '@nestjs/common';
import { Invoice } from '../entity/invoice.entity';
import { InvoiceCreateDTO, InvoiceDTO } from '@tk-postral/payment-common';
import { InvoiceAddressMapper } from './invoice-address.mapper';
import { InvoiceAccountMapper } from './invoice-account.mapper';


@Injectable()
export class InvoiceMapper {
    constructor(
        private readonly invoiceAddressMapper: InvoiceAddressMapper,
        private readonly invoiceAccountMapper: InvoiceAccountMapper,
    ) {}

    toDto(entity: Invoice): InvoiceDTO {
        const dto: InvoiceDTO = {
            id: entity.id,
            paymentId: entity.paymentId,
            transactionId: entity.transactionId,
            invoiceNumber: entity.invoiceNumber,
            invoiceDate: entity.invoiceDate,
            status: entity.status,
            uploadedByUserId: entity.uploadedByUserId,
            notes: entity.notes,
            createdAt: entity.createdAt,
            updatedAt: entity.updatedAt,
        };

        if (entity.sellerInvoiceAddress) {
            dto.sellerInvoiceAddress = this.invoiceAddressMapper.toDto(entity.sellerInvoiceAddress);
        }
        if (entity.sellerInvoiceAccount) {
            dto.sellerInvoiceAccount = this.invoiceAccountMapper.toDto(entity.sellerInvoiceAccount);
        }
        if (entity.customerInvoiceAddress) {
            dto.customerInvoiceAddress = this.invoiceAddressMapper.toDto(entity.customerInvoiceAddress);
        }
        if (entity.customerAccount) {
            dto.customerAccount = this.invoiceAccountMapper.toDto(entity.customerAccount);
        }

        return dto;
    }

    toEntity(dto: InvoiceCreateDTO): Invoice {
        const entity = new Invoice();
        entity.paymentId = dto.paymentId;
        entity.transactionId = dto.transactionId;
        entity.invoiceNumber = dto.invoiceNumber || "";
        entity.invoiceDate = dto.invoiceDate || new Date();
        entity.uploadedByUserId = dto.uploadedByUserId || "";
        entity.notes = dto.notes || "";
        if (dto.sellerInvoiceAddress) {
            entity.sellerInvoiceAddress = this.invoiceAddressMapper.toEntity(dto.sellerInvoiceAddress);
        }
        if (dto.sellerInvoiceAccount) {
            entity.sellerInvoiceAccount = this.invoiceAccountMapper.toEntity(dto.sellerInvoiceAccount);
        }
        if (dto.customerInvoiceAddress) {
            entity.customerInvoiceAddress = this.invoiceAddressMapper.toEntity(dto.customerInvoiceAddress);
        }
        if (dto.customerAccount) {
            entity.customerAccount = this.invoiceAccountMapper.toEntity(dto.customerAccount);
        }
        entity.status = 'UPLOADED';
        return entity;
    }
}
