import {
    Controller,
    Get,
    Post,
    Put,
    Delete,
    Param,
    Body,
    UseInterceptors,
} from '@nestjs/common';
import { InvoiceService } from '../service/invoice.service';
import {
    InvoiceDTO,
    InvoiceCreateDTO,
    InvoiceUpdateDTO,
} from '@tk-postral/payment-common';
import { MessagePattern } from '@nestjs/microservices';
import { UserAuthBackendDTO } from '@ubs-platform/users-common';
import { PaymentService } from '../service/payment.service';
import { TransactionSearchService } from '../service/transaction-search.service';
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
    constructor(private readonly invoiceService: InvoiceService,
        private readonly transactionService: TransactionSearchService,
        private readonly paymentService: PaymentService,
    ) { }

    // Dosya yükleme işlemini farklı serviste yapacağım invoice id ile eşlenecek. O nedenle sadece metadata işlemleri burada olacak.
    @Post()
    @UseInterceptors()
    async create(@Body() createDto: InvoiceCreateDTO): Promise<InvoiceDTO> {
        return this.invoiceService.create(createDto);
    }

    @Get(':id')
    async findById(@Param('id') id: string): Promise<InvoiceDTO> {
        return this.invoiceService.findById(id);
    }

    @Get('payment/:paymentId')
    async findByPaymentId(
        @Param('paymentId') paymentId: string,
    ): Promise<InvoiceDTO[]> {
        return this.invoiceService.findByPaymentId(paymentId);
    }

    @Put(':id')
    async update(
        @Param('id') id: string,
        @Body() updateDto: InvoiceUpdateDTO,
    ): Promise<InvoiceDTO> {
        return this.invoiceService.update(id, updateDto);
    }

    @Delete(':id')
    async delete(@Param('id') id: string): Promise<void> {
        return this.invoiceService.delete(id);
    }

    @MessagePattern('file-get-POSTRAL_INVOICE')
    async fileGetAllowance({
        userId,
        objectId,
        roles,
    }: UploadFileCategoryRequest): Promise<boolean> {
        // exec(`kdialog --msgbox "file-get-POSTRAL_INVOICE event received with objectId: ${objectId}" 10 50`);
        try {
            const [paymentId, transactionId] = objectId.split('_');

            const transaction = await this.transactionService.findAll(
                {
                    paymentId,
                    id: transactionId,
                    admin: roles.includes('ADMIN') ? 'true' : 'false',
                },
                { id: userId, roles } as UserAuthBackendDTO,
            );
            if (!transaction) {
                return false;
            }

            return true;
        } catch (error) {
            console.error('Error in fileGetAllowance:', error);
            return false;
        }
    }

    @MessagePattern('file-upload-POSTRAL_INVOICE')
    async thumbUploadInfo({
        userId,
        objectId,
        roles,
    }: UploadFileCategoryRequest): Promise<UploadFileCategoryResponse> {
        // exec(`kdialog --msgbox "file-upload-POSTRAL_INVOICE event received with objectId: ${objectId}" 10 50`);
        try {
            const invoiceId = objectId;

            const invoice = await this.invoiceService.findById(invoiceId);

            const finalizedInvoices = await this.invoiceService.findAll(
                {
                    paymentId: invoice.paymentId,
                    finalized: 'true',
                },
            );

            if (finalizedInvoices.length > 0) {
                throw new Error('A finalized invoice already exists for this payment');
            }

            const transaction = await this.transactionService.findAll(
                {
                    paymentId: invoice.paymentId,
                    id: invoice.transactionId,
                    admin: roles.includes('ADMIN') ? 'true' : 'false',
                },
                { id: userId, roles } as UserAuthBackendDTO,
            );

            if (!transaction) {
                throw new Error('Transaction not found');
            }

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
}
