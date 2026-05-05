import {
    Controller,
    Get,
    Post,
    Put,
    Delete,
    Param,
    Body,
    UseInterceptors,
    UseGuards,
    Query,
    Res,
} from '@nestjs/common';
import { FastifyReply } from 'fastify';
import { InvoiceService } from '../service/invoice.service';
import {
    InvoiceDTO,
    InvoiceCreateDTO,
    InvoiceUpdateDTO,
    InvoiceSearchPaginationDTO,
    PaymentTransactionDTO,
} from '@tk-postral/payment-common';
import { MessagePattern } from '@nestjs/microservices';
import { UserAuthBackendDTO } from '@ubs-platform/users-common';
import { PaymentService } from '../service/payment.service';
import { SellerPaymentOrderSearchService } from '../service/transaction-search.service';
import {
    CurrentUser,
    EntityOwnershipService,
    JwtAuthGuard,
} from '@ubs-platform/users-microservice-helper';
import { SearchResult } from '@ubs-platform/crud-base-common';
import { exec } from 'child_process';
import { AuthUtilService } from '../service/auth-util.service';
import { PostralConstants } from '../util/consts';
import { lastValueFrom } from 'rxjs';
import { UblGeneratorService } from '../service/ubl-generator.service';

export interface UploadFileCategoryResponse {
    category?: string;
    name?: string;
    error?: string;
    maxLimitBytes?: number;
    volatile?: boolean;
    durationMiliseconds?: number;
    needAuthorizationAtView?: boolean;
}

export interface UploadFileCategoryRequest {
    userId: string;
    objectId: string;
    roles: string[];
}

@Controller('invoice')
export class InvoiceController {
    constructor(
        private readonly invoiceService: InvoiceService,
        private readonly transactionService: SellerPaymentOrderSearchService,
        private readonly paymentService: PaymentService,
        private readonly paymentSearchService: SellerPaymentOrderSearchService,
        private readonly eoService: EntityOwnershipService,
        private readonly ublGeneratorService: UblGeneratorService,
    ) { }



    private async assertNoFinalizedTransaction(
        paymentId: string,
        sellerPaymentOrderId: string,
    ) {
        const finalizedInvoices = await this.invoiceService.findAll({
            paymentId,
            sellerPaymentOrderId: sellerPaymentOrderId,
            finalized: 'true',
        });

        if (finalizedInvoices.length > 0) {
            throw new Error(
                'A finalized invoice already exists for this payment',
            );
        }
    }

    // Dosya yükleme işlemini farklı serviste yapacağım invoice id ile eşlenecek. O nedenle sadece metadata işlemleri burada olacak.
    @Post()
    @UseInterceptors()
    @UseGuards(JwtAuthGuard)
    async create(@Body() createDto: InvoiceCreateDTO): Promise<InvoiceDTO> {

        return this.invoiceService.create(createDto);
    }

    @Get(':id')
    async findById(@Param('id') id: string): Promise<InvoiceDTO> {
        return this.invoiceService.findById(id);
    }

    @Put(':id')
    async update(
        @Param('id') id: string,
        @Body() updateDto: InvoiceUpdateDTO,
    ): Promise<InvoiceDTO> {
        return this.invoiceService.update(id, updateDto);
    }

    @Delete(':id')
    @UseGuards(JwtAuthGuard)
    async delete(@Param('id') id: string, @CurrentUser() user: UserAuthBackendDTO): Promise<void> {
        return await this.invoiceService.delete(id, user);
    }

    @Get('')
    async fetchAll(
        @Query() q: InvoiceSearchPaginationDTO,
    ): Promise<InvoiceDTO[]> {
        return await this.invoiceService.findAll(q);
    }

    @Get('_search')
    async search(
        @Query() q: InvoiceSearchPaginationDTO,
    ): Promise<SearchResult<InvoiceDTO>> {
        return await this.invoiceService.search(q);
    }


    @Get(':id/ubl')
    @UseGuards(JwtAuthGuard)
    async downloadUbl(
        @Param('id') id: string,
        @CurrentUser() user: UserAuthBackendDTO,
        @Res() reply: FastifyReply,
    ): Promise<void> {
        const invoice = await this.invoiceService.findById(id);
        const sellerAccountId = invoice.sellerInvoiceAccount?.realAccountId;
        if (!sellerAccountId) {
            throw new Error('Seller or customer account information is missing');
        }
        if (sellerAccountId) {
            await this.invoiceService.assertSellerIsOwner(user, sellerAccountId);
        }
        // await this.invoiceService.assertSellerIsOwner(sellerAccountId, user);
        const xmlContent = await this.ublGeneratorService.generateUblXml(invoice);
        const safeBase = (invoice.invoiceNumber || id).replace(/[^a-zA-Z0-9\-_.]/g, '_');
        const safeFilename = `invoice-${safeBase}.xml`;
        reply
            .header('Content-Disposition', `attachment; filename="${safeFilename}"`)
            .type('application/xml')
            .send(xmlContent);
    }

    @Put(':id/finalize')
    @UseGuards(JwtAuthGuard)
    async finalize(@Param('id') id: string, @CurrentUser() user: UserAuthBackendDTO): Promise<InvoiceDTO> {
        return this.invoiceService.finalize(id, user);
    }

    @Post('/from-transaction/:sellerPaymentOrderId')
    @UseGuards(JwtAuthGuard)
    async createFromTransaction(
        @Param('sellerPaymentOrderId') sellerPaymentOrderId: string,
        // @Body() createDto: InvoiceCreateDTO,
        @CurrentUser() user: UserAuthBackendDTO,
    ): Promise<InvoiceDTO> {

        const transaction = await this.transactionService.fetchById(
            sellerPaymentOrderId,
            user,
        );
        if (!transaction) {
            throw new Error('Transaction not found');
        }

        await this.invoiceService.assertSellerIsOwner(user, transaction.targetAccountId);
        // exec(`kdialog --msgbox "Creating invoice from transaction with id: ${sellerPaymentOrderId} for user: ${user.id}, paymentId: ${transaction.paymentId}" 10 50`);
        const payment = await this.paymentService.findPaymentById(
            transaction.paymentId,
            true,
        );
        if (!payment) {
            throw new Error('Payment not found');
        }

        return this.invoiceService.createFromTransaction(
            transaction,
        );
    }




    @MessagePattern('file-upload-POSTRAL_INVOICE')
    async thumbUploadInfo({
        userId,
        objectId,
        roles,
    }: UploadFileCategoryRequest): Promise<UploadFileCategoryResponse> {
        // exec(`kdialog --msgbox "file-upload-POSTRAL_INVOICE event received with objectId: ${objectId}" 10 50`);
        const user = { id: userId, roles } as UserAuthBackendDTO;
        try {
            const invoiceId = objectId;

            const invoice = await this.invoiceService.findById(invoiceId);

            await this.assertNoFinalizedTransaction(
                invoice.paymentId!,
                invoice.sellerPaymentOrderId!,
            );

            const sellerOrderPayments = await this.transactionService.findAll(
                {
                    paymentId: invoice.paymentId,
                    id: invoice.sellerPaymentOrderId,
                    admin: roles.includes('ADMIN') ? 'true' : 'false',
                },
                user,
            );

            if (!sellerOrderPayments?.length) {
                throw new Error('Seller order payments not found');
            }

            await this.invoiceService.assertSellerIsOwner(user, sellerOrderPayments[0].targetAccountId);

            const name = objectId,
                category = 'POSTRAL_INVOICE';
            return {
                category,
                name,
                volatile: false,
                maxLimitBytes: 3000000,
                needAuthorizationAtView: true,
            };
        } catch (error) {
            console.error('Error in thumbUploadInfo:', error);
            return { error: error.message };
        }
    }

    @MessagePattern('file-get-POSTRAL_INVOICE')
    async fileGetAllowance({
        userId,
        objectId,
        roles,
    }: UploadFileCategoryRequest): Promise<boolean> {
        // exec(`kdialog --msgbox "file-get-POSTRAL_INVOICE event received with objectId: ${objectId}" 10 50`);
        try {
            const [paymentId, sellerPaymentOrderId] = objectId.split('_');

            const transactions = await this.transactionService.findAll(
                {
                    paymentId,
                    id: sellerPaymentOrderId,
                    admin: roles.includes('ADMIN') ? 'true' : 'false',
                },
                { id: userId, roles } as UserAuthBackendDTO,
            );
            if (!transactions?.length) {
                return false;
            }

            return true;
        } catch (error) {
            console.error('Error in fileGetAllowance:', error);
            return false;
        }
    }
}
