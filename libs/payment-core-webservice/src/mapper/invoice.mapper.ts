import { Inject, Injectable } from '@nestjs/common';
import { Invoice, SellerPaymentOrder } from '@tk-postral/postral-entities';
import {
    InvoiceCreateDTO,
    InvoiceDTO,
    PaymentDTO,
    PaymentFullDTO,
    PaymentTransactionDTO,
} from '@tk-postral/payment-common';
import { InvoiceAddressMapper } from './invoice-address.mapper';
import { InvoiceAccountMapper } from './invoice-account.mapper';
import { Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { SellerPaymentOrderSearchService } from '../service/transaction-search.service';

@Injectable()
export class InvoiceMapper {
    constructor(
        private readonly invoiceAddressMapper: InvoiceAddressMapper,
        private readonly invoiceAccountMapper: InvoiceAccountMapper,
        // private readonly transactionRepository: Repository<PaymentTransaction>,
        private readonly transactionSearchService: SellerPaymentOrderSearchService,
    ) {}

    toDto(entity: Invoice): InvoiceDTO {
        const dto: InvoiceDTO = {
            id: entity.id,
            paymentId: entity.paymentId!,
            sellerPaymentOrderId: entity.sellerPaymentOrderId!,
            invoiceNumber: entity.invoiceNumber,
            invoiceDate: entity.invoiceDate,
            status: "",
            uploadedByUserId: entity.uploadedByUserId,
            notes: entity.notes,
            createdAt: entity.createdAt,
            updatedAt: entity.updatedAt,
            finalized: entity.finalized
        };

        if (entity.sellerSnapshotAddress) {
            dto.sellerInvoiceAddress = this.invoiceAddressMapper.toDto(
                entity.sellerSnapshotAddress,
            );
        }
        if (entity.sellerSnapshotAccount) {
            dto.sellerInvoiceAccount = this.invoiceAccountMapper.toDto(
                entity.sellerSnapshotAccount,
            );
        }
        if (entity.customerSnapshotAddress) {
            dto.customerInvoiceAddress = this.invoiceAddressMapper.toDto(
                entity.customerSnapshotAddress,
            );
        }
        if (entity.customerSnapshotAccount) {
            dto.customerAccount = this.invoiceAccountMapper.toDto(
                entity.customerSnapshotAccount,
            );
        }

        return dto;
    }

    async toEntityFromTransaction(
        sellerPaymentOrderId: string,
        userId?: string,
    ) {
        const transaction = await this.transactionSearchService.fetchByIdWithRelationsInternal(sellerPaymentOrderId);
        if (!transaction) {
            throw new Error('Transaction not found for id: ' + sellerPaymentOrderId);
        }
        if (!transaction.sourceAccount || !transaction.targetAccount) {
            throw new Error('Transaction accounts not found for id: ' + sellerPaymentOrderId);
        }
        // Faturalama adresi: billingAddress varsa onu kullan, yoksa sourceAccount.defaultAddress'e dön.
        const customerBillingAddress = transaction.billingAddress ?? transaction.sourceAccount.defaultAddress;
        if (!customerBillingAddress || !transaction.targetAccount.defaultAddress) {
            throw new Error('Transaction account addresses not found for id: ' + sellerPaymentOrderId);
        }
        const entity = new Invoice();
        entity.paymentId = transaction.paymentId;
        entity.sellerPaymentOrderId = transaction.id!;
        entity.invoiceNumber = "";
        entity.invoiceDate = new Date(transaction.createdAt) || new Date();
        entity.uploadedByUserId = userId || '';
        entity.finalized = false;
        entity.notes = '';
        // İade durumlarında transaction.transactionType source ve target hesapların yer değiştirebilir ama satıcının müşteri olarak gözükmesi istenmez, bu yüzden transactionType kontrolü yapılmaz

        entity.sellerSnapshotAccountId = transaction.sellerSnapshotAccountId;
        entity.sellerSnapshotAddressId = transaction.sellerSnapshotAddressId;
        entity.customerSnapshotAccountId = transaction.customerSnapshotAccountId;
        entity.customerSnapshotAddressId = transaction.customerSnapshotAddressId;
        // entity.sellerSnapshotAccountId = transaction.sourceAccountId
        // entity.sellerInvoiceAccount = this.invoiceAccountMapper.toEntityFromNormalAccount(seller!);
        // entity.customerAccount = this.invoiceAccountMapper.toEntityFromNormalAccount(transaction.sourceAccount!);
        // entity.sellerInvoiceAddress = this.invoiceAddressMapper.toEntityFromAccountAddress(seller!.defaultAddress!);
        // entity.customerInvoiceAddress = this.invoiceAddressMapper.toEntityFromAccountAddress(customerBillingAddress!);

        return entity;
    }

    toEntity(dto: InvoiceCreateDTO): Invoice {
        const entity = new Invoice();
        entity.paymentId = dto.paymentId;
        entity.sellerPaymentOrderId = dto.sellerPaymentOrderId;
        entity.invoiceNumber = dto.invoiceNumber || '';
        entity.invoiceDate = dto.invoiceDate || new Date();
        entity.uploadedByUserId = dto.uploadedByUserId || '';
        entity.notes = dto.notes || '';
        entity.finalized = false;
        // entity.status = 'UPLOADED';
        return entity;
    }
}
