import {
    Controller,
    Get,
    Post,
    Put,
    Delete,
    Param,
    Body,
    Query,
    UploadedFile,
    UseInterceptors,
    Res,
    BadRequestException,
    StreamableFile,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { Response } from 'express';
import { diskStorage } from 'multer';
import { extname } from 'path';
import { createReadStream } from 'fs';
import { InvoiceService } from '../service/invoice.service';
import { InvoiceDTO, InvoiceCreateDTO, InvoiceUpdateDTO } from '@tk-postral/payment-common';


@Controller('invoice')
export class InvoiceController {
    constructor(private readonly invoiceService: InvoiceService) {}

    /**
     * Dosya yüklemek için multer konfigürasyonu
     */
    private getMulterOptions() {
        return {
            storage: diskStorage({
                destination: './uploads/invoices', // Dosyaların saklanacağı klasör
                filename: (req, file, cb) => {
                    // Unique dosya adı oluştur
                    const uniqueSuffix =
                        Date.now() + '-' + Math.round(Math.random() * 1e9);
                    const ext = extname(file.originalname);
                    cb(null, `invoice-${uniqueSuffix}${ext}`);
                },
            }),
            limits: {
                fileSize: 10 * 1024 * 1024, // 10MB limit
            },
            fileFilter: (req, file, cb) => {
                // Sadece belirli dosya tiplerini kabul et
                const allowedMimes = [
                    'application/pdf',
                    'image/jpeg',
                    'image/jpg',
                    'image/png',
                    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
                ];

                if (allowedMimes.includes(file.mimetype)) {
                    cb(null, true);
                } else {
                    cb(
                        new BadRequestException(
                            'Sadece PDF, JPEG, PNG ve DOCX dosyaları yüklenebilir',
                        ),
                        false,
                    );
                }
            },
        };
    }

    /**
     * Fatura dosyası yükle
     * POST /invoice/upload
     */
    @Post('upload')
    @UseInterceptors(FileInterceptor('file', {}))
    async uploadInvoice(
        @UploadedFile() file: Express.Multer.File,
        @Body('paymentId') paymentId?: string,
        @Body('transactionId') transactionId?: string,
        @Body('invoiceNumber') invoiceNumber?: string,
        @Body('invoiceDate') invoiceDate?: string,
        @Body('uploadedByUserId') uploadedByUserId?: string,
        @Body('notes') notes?: string,
    ): Promise<InvoiceDTO> {
        if (!file) {
            throw new BadRequestException('Dosya yüklenmedi');
        }

        const createDto: InvoiceCreateDTO = {
            paymentId,
            transactionId,
            filePath: file.path,
            originalFileName: file.originalname,
            fileSize: file.size,
            mimeType: file.mimetype,
            invoiceNumber,
            invoiceDate: invoiceDate ? new Date(invoiceDate) : undefined,
            uploadedByUserId,
            notes,
        };

        return await this.invoiceService.create(createDto);
    }

    /**
     * ID'ye göre fatura bilgisi getir
     * GET /invoice/:id
     */
    @Get(':id')
    async getInvoice(@Param('id') id: string): Promise<InvoiceDTO> {
        return await this.invoiceService.findById(id);
    }

    /**
     * Fatura dosyasını indir
     * GET /invoice/:id/download
     */
    @Get(':id/download')
    async downloadInvoice(
        @Param('id') id: string,
        @Res({ passthrough: true }) res: Response,
    ): Promise<StreamableFile> {
        const invoice = await this.invoiceService.findById(id);
        const filePath = await this.invoiceService.getFilePath(id);

        const fileExists = await this.invoiceService.checkFileExists(id);
        if (!fileExists) {
            throw new BadRequestException('Fatura dosyası bulunamadı');
        }

        const file = createReadStream(filePath);

        res.set({
            'Content-Type': invoice.mimeType,
            'Content-Disposition': `attachment; filename="${invoice.originalFileName}"`,
        });

        return new StreamableFile(file);
    }

    /**
     * PaymentId'ye göre faturaları listele
     * GET /invoice/payment/:paymentId
     */
    @Get('payment/:paymentId')
    async getInvoicesByPayment(
        @Param('paymentId') paymentId: string,
    ): Promise<InvoiceDTO[]> {
        return await this.invoiceService.findByPaymentId(paymentId);
    }

    /**
     * TransactionId'ye göre faturaları listele
     * GET /invoice/transaction/:transactionId
     */
    @Get('transaction/:transactionId')
    async getInvoicesByTransaction(
        @Param('transactionId') transactionId: string,
    ): Promise<InvoiceDTO[]> {
        return await this.invoiceService.findByTransactionId(transactionId);
    }

    /**
     * Tüm faturaları listele (pagination ile)
     * GET /invoice?skip=0&take=50
     */
    @Get()
    async getAllInvoices(
        @Query('skip') skip?: number,
        @Query('take') take?: number,
    ): Promise<InvoiceDTO[]> {
        return await this.invoiceService.findAll(skip, take);
    }

    /**
     * Fatura bilgilerini güncelle
     * PUT /invoice/:id
     */
    @Put(':id')
    async updateInvoice(
        @Param('id') id: string,
        @Body() updateDto: InvoiceUpdateDTO,
    ): Promise<InvoiceDTO> {
        return await this.invoiceService.update(id, updateDto);
    }

    /**
     * Faturayı sil (hem veritabanından hem dosya sisteminden)
     * DELETE /invoice/:id
     */
    @Delete(':id')
    async deleteInvoice(@Param('id') id: string): Promise<{ message: string }> {
        await this.invoiceService.delete(id);
        return { message: 'Fatura başarıyla silindi' };
    }
}
