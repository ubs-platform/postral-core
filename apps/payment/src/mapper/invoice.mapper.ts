import { Inject, Injectable } from '@nestjs/common';
import { Invoice } from '../entity/invoice.entity';
import {
    InvoiceCreateDTO,
    InvoiceDTO,
    PaymentDTO,
    PaymentFullDTO,
    PaymentTransactionDTO,
} from '@tk-postral/payment-common';
import { InvoiceAddressMapper } from './invoice-address.mapper';
import { InvoiceAccountMapper } from './invoice-account.mapper';
import { PaymentTransaction } from '../entity';
import { Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { TransactionSearchService } from '../service/transaction-search.service';

@Injectable()
export class InvoiceMapper {
    constructor(
        private readonly invoiceAddressMapper: InvoiceAddressMapper,
        private readonly invoiceAccountMapper: InvoiceAccountMapper,
        // private readonly transactionRepository: Repository<PaymentTransaction>,
        private readonly transactionSearchService: TransactionSearchService,
    ) {}

    toDto(entity: Invoice): InvoiceDTO {
        const dto: InvoiceDTO = {
            id: entity.id,
            paymentId: entity.paymentId,
            transactionId: entity.transactionId,
            invoiceNumber: entity.invoiceNumber,
            invoiceDate: entity.invoiceDate,
            status: "",
            uploadedByUserId: entity.uploadedByUserId,
            notes: entity.notes,
            createdAt: entity.createdAt,
            updatedAt: entity.updatedAt,
            finalized: entity.finalized
        };

        if (entity.sellerInvoiceAddress) {
            dto.sellerInvoiceAddress = this.invoiceAddressMapper.toDto(
                entity.sellerInvoiceAddress,
            );
        }
        if (entity.sellerInvoiceAccount) {
            dto.sellerInvoiceAccount = this.invoiceAccountMapper.toDto(
                entity.sellerInvoiceAccount,
            );
        }
        if (entity.customerInvoiceAddress) {
            dto.customerInvoiceAddress = this.invoiceAddressMapper.toDto(
                entity.customerInvoiceAddress,
            );
        }
        if (entity.customerAccount) {
            dto.customerAccount = this.invoiceAccountMapper.toDto(
                entity.customerAccount,
            );
        }

        return dto;
    }

    async toEntityFromTransaction(
        transactionId: string,
        userId?: string,
    ) {
        const transaction = await this.transactionSearchService.fetchByIdWithRelationsInternal(transactionId);
        if (!transaction) {
            throw new Error('Transaction not found for id: ' + transactionId);
        }
        if (!transaction.sourceAccount || !transaction.targetAccount) {
            throw new Error('Transaction accounts not found for id: ' + transactionId);
        }
        if (!transaction.sourceAccount.defaultAddress || !transaction.targetAccount.defaultAddress) {
            throw new Error('Transaction account addresses not found for id: ' + transactionId);
        }
        const entity = new Invoice();
        entity.paymentId = transaction.paymentId;
        entity.transactionId = transaction.id!;
        entity.invoiceNumber = "";
        entity.invoiceDate = new Date(transaction.createdAt) || new Date();
        entity.uploadedByUserId = userId || '';
        entity.finalized = false;
        entity.notes = '';
        // İade durumlarında transaction.transactionType source ve target hesapların yer değiştirebilir ama satıcının müşteri olarak gözükmesi istenmez, bu yüzden transactionType kontrolü yapılmaz
        const customer = transaction.sourceAccount, seller = transaction.targetAccount;

        entity.sellerInvoiceAccount = this.invoiceAccountMapper.toEntityFromNormalAccount(seller!);
        entity.customerAccount = this.invoiceAccountMapper.toEntityFromNormalAccount(customer!);
        entity.sellerInvoiceAddress = this.invoiceAddressMapper.toEntityFromAccountAddress(seller!.defaultAddress!);
        entity.customerInvoiceAddress = this.invoiceAddressMapper.toEntityFromAccountAddress(customer!.defaultAddress!);

        return entity;
    }

    toEntity(dto: InvoiceCreateDTO): Invoice {
        const entity = new Invoice();
        entity.paymentId = dto.paymentId;
        entity.transactionId = dto.transactionId;
        entity.invoiceNumber = dto.invoiceNumber || '';
        entity.invoiceDate = dto.invoiceDate || new Date();
        entity.uploadedByUserId = dto.uploadedByUserId || '';
        entity.notes = dto.notes || '';
        entity.finalized = false;
        if (dto.sellerInvoiceAddress) {
            entity.sellerInvoiceAddress = this.invoiceAddressMapper.toEntity(
                dto.sellerInvoiceAddress,
            );
        }
        if (dto.sellerInvoiceAccount) {
            entity.sellerInvoiceAccount = this.invoiceAccountMapper.toEntity(
                dto.sellerInvoiceAccount,
            );
        }
        if (dto.customerInvoiceAddress) {
            entity.customerInvoiceAddress = this.invoiceAddressMapper.toEntity(
                dto.customerInvoiceAddress,
            );
        }
        if (dto.customerAccount) {
            entity.customerAccount = this.invoiceAccountMapper.toEntity(
                dto.customerAccount,
            );
        }
        // entity.status = 'UPLOADED';
        return entity;
    }
}
