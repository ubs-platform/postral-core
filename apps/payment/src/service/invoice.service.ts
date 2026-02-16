import {
    Injectable,
    NotFoundException,
    BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Invoice } from '../entity/invoice.entity';
import { InvoiceMapper } from '../mapper/invoice.mapper';
import {
    InvoiceCreateDTO,
    InvoiceDTO,
    InvoiceSearchDTO,
    InvoiceSearchPaginationDTO,
    InvoiceUpdateDTO,
    PaymentDTO,
    PaymentFullDTO,
    PaymentTransactionDTO,
} from '@tk-postral/payment-common';
import * as fs from 'fs/promises';
import * as path from 'path';
import { SearchResult } from '@ubs-platform/crud-base-common';
import { TypeormSearchUtil } from './base/typeorm-search-util';

@Injectable()
export class InvoiceService {
    constructor(
        @InjectRepository(Invoice)
        private readonly invoiceRepo: Repository<Invoice>,
        private readonly invoiceMapper: InvoiceMapper,
    ) {}

    /**
     * Yeni fatura kaydı oluşturur
     */
    async create(createDto: InvoiceCreateDTO): Promise<InvoiceDTO> {
        // Eğer paymentId veya transactionId belirtilmişse, en az biri olmalı
        if (!createDto.paymentId && !createDto.transactionId) {
            throw new BadRequestException(
                'PaymentId veya TransactionId belirtilmelidir',
            );
        }

        const entity = this.invoiceMapper.toEntity(createDto);
        const saved = await this.invoiceRepo.save(entity);
        return this.invoiceMapper.toDto(saved);
    }

    /**
     * ID'ye göre fatura getirir
     */
    async findById(id: string): Promise<InvoiceDTO> {
        const invoice = await this.invoiceRepo.findOne({ where: { id } });

        if (!invoice) {
            throw new NotFoundException(`Invoice with id ${id} not found`);
        }

        return this.invoiceMapper.toDto(invoice);
    }

    /**
     * PaymentId'ye göre faturaları listeler
     */
    async findByPaymentId(paymentId: string): Promise<InvoiceDTO[]> {
        const invoices = await this.invoiceRepo.find({
            where: { paymentId },
            order: { createdAt: 'DESC' },
        });

        return invoices.map((inv) => this.invoiceMapper.toDto(inv));
    }

    /**
     * TransactionId'ye göre faturaları listeler
     */
    async findByTransactionId(transactionId: string): Promise<InvoiceDTO[]> {
        const invoices = await this.invoiceRepo.find({
            where: { transactionId },
            order: { createdAt: 'DESC' },
        });

        return invoices.map((inv) => this.invoiceMapper.toDto(inv));
    }

    /**
     * Fatura bilgilerini günceller
     */
    async update(id: string, updateDto: InvoiceUpdateDTO): Promise<InvoiceDTO> {
        const invoice = await this.invoiceRepo.findOne({ where: { id } });

        if (!invoice) {
            throw new NotFoundException(`Invoice with id ${id} not found`);
        }

        if (updateDto.invoiceNumber !== undefined) {
            invoice.invoiceNumber = updateDto.invoiceNumber;
        }
        if (updateDto.invoiceDate !== undefined) {
            invoice.invoiceDate = updateDto.invoiceDate;
        }
        // if (updateDto.status !== undefined) {
        //     invoice.status = updateDto.status;
        // }
        if (updateDto.notes !== undefined) {
            invoice.notes = updateDto.notes;
        }

        const updated = await this.invoiceRepo.save(invoice);
        return this.invoiceMapper.toDto(updated);
    }

    /**
     * Faturayı siler (hem veritabanından hem de dosya sisteminden)
     */
    async delete(id: string): Promise<void> {
        const invoice = await this.invoiceRepo.findOne({ where: { id } });

        if (!invoice) {
            throw new NotFoundException(`Invoice with id ${id} not found`);
        }

        // TODO: Dosya silme işlemi için dosya servisine event atacağız. şimdilik kalsın
        // // Önce dosyayı silmeyi dene (optional - hata olursa da devam edebiliriz)
        // try {
        //     await fs.unlink(invoice.filePath);
        // } catch (error) {
        //     console.warn(`Could not delete file at ${invoice.filePath}:`, error);
        //     // Dosya silinemese bile veritabanı kaydını sileceğiz
        // }

        await this.invoiceRepo.remove(invoice);
    }

    async findAll(search: InvoiceSearchDTO): Promise<InvoiceDTO[]> {
        const where = await this.whereClause(search);
        const invoices = await this.invoiceRepo.find({
            where,
            order: { createdAt: 'DESC' },
        });

        return invoices.map((inv) => this.invoiceMapper.toDto(inv));
    }

    async search(
        search: InvoiceSearchPaginationDTO,
    ): Promise<SearchResult<InvoiceDTO>> {
        const where = await this.whereClause(search);
        const sortKey = search.sortBy || 'createdAt';
        const sortOrder = search.sortRotation || 'desc';
        return (
            await TypeormSearchUtil.modelSearch<Invoice>(
                this.invoiceRepo,
                search.size,
                search.page,
                { [sortKey]: sortOrder },
                [
                    'customerInvoiceAddress',
                    'customerAccount',
                    'sellerInvoiceAddress',
                    'sellerInvoiceAccount',
                ],
                where,
            )
        ).map((p) => this.invoiceMapper.toDto(p));
    }

    async whereClause(search: InvoiceSearchDTO): Promise<any> {
        const where: any = {};
        if (search.finalized !== undefined) {
            where.finalized =
                search.finalized === 'true' || search.finalized === true
                    ? true
                    : false;
        }

        if (search.paymentId) {
            where.paymentId = search.paymentId;
        }
        if (search.transactionId) {
            where.transactionId = search.transactionId;
        }
        if (search.invoiceNumber) {
            where.invoiceNumber = search.invoiceNumber;
        }
        if (search.status) {
            where.status = search.status;
        }

        return where;
    }

    finalize(id: string): InvoiceDTO | PromiseLike<InvoiceDTO> {
        return this.invoiceRepo.manager.transaction(
            async (transactionalEntityManager) => {
                const invoice = await transactionalEntityManager.findOne(
                    Invoice,
                    { where: { id } },
                );

                if (!invoice) {
                    throw new NotFoundException(
                        `Invoice with id ${id} not found`,
                    );
                }

                // Fatura zaten finalize edilmişse tekrar finalize etmeye gerek yok
                if (invoice.finalized) {
                    return this.invoiceMapper.toDto(invoice);
                }

                // Faturayı finalize et
                invoice.finalized = true;
                const updatedInvoice =
                    await transactionalEntityManager.save(invoice);
                return this.invoiceMapper.toDto(updatedInvoice);
            },
        );
    }

    async createFromTransaction(
        transaction: PaymentTransactionDTO,
    ): Promise<InvoiceDTO | PromiseLike<InvoiceDTO>> {
        const entity = await this.invoiceMapper.toEntityFromTransaction(
            transaction.id!
        );
        return this.invoiceMapper.toDto(await this.invoiceRepo.save(entity));
    }
}
