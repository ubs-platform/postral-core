import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Payment } from '../entity/payment.entity';
import { Repository } from 'typeorm';
import { PostralPaymentItem } from '../entity/payment-item.entity';
import { PaymentMapper } from '../mapper/payment.mapper';
import { PaymentItemMapper } from '../mapper/payment-item.mapper';
import { TaxCalculationUtil } from '../util/calcs/tax-calculations';
import { EventSenderService } from './event-management.service';
import {
    PaymentItemDto,
    PaymentInitDTO,
    PaymentDTO,
    TaxDTO,
    PaymentFullDTO,
    SellerPaymentOrderDTO,
} from '@tk-postral/payment-common';
import { PaymentTaxMapper } from '../mapper/payment-tax.mapper';
import { TransactionMapper } from '../mapper/transaction.mapper';
import { PaymentCaptureInfoDTO } from '@tk-postral/payment-common/dto/capture-info.dto';
import { SellerPaymentOrderService } from './transaction.service';
import { AccountService } from './account.service';
import { CalculationService } from './calculation.service';
import { PaymentOperationManagementService } from './payment-operation-management.service';
import { Subject } from 'rxjs';
import { Optional } from '@ubs-platform/crud-base-common/utils';
import { RefundRequestDTO } from '@tk-postral/payment-common';
import { Cron } from '@nestjs/schedule';
import { AccountPaymentTransactionService } from './account-payment-transaction.service';
import { ReportService } from './report.service';

@Injectable()
export class PaymentService {
    paymentStream = new Subject<PaymentDTO>();

    constructor(
        @InjectRepository(Payment)
        private readonly paymentrepo: Repository<Payment>,
        private paymentMapper: PaymentMapper,
        private paymentItemMapper: PaymentItemMapper,
        private paymentTaxMapper: PaymentTaxMapper,
        private eventSenderService: EventSenderService,
        private sellerPaymentOrderService: SellerPaymentOrderService,
        private accountService: AccountService,
        private calcService: CalculationService,
        private paymentOperationManagementService: PaymentOperationManagementService,
        private accountPaymentTransactionService: AccountPaymentTransactionService,
        private reportService: ReportService,
        private transactionMapper: TransactionMapper,
    ) { }

    async onModuleInit() {

        // this.localEventService.operationsUpdated.subscribe(async (paymentId) => {
        //     await this.updatePaymentByOperationStatuses(paymentId);
        // });
    }

    async findAllRaw(): Promise<Payment[]> {
        return this.paymentrepo.find();
    }

    async findItems(id: string): Promise<PaymentItemDto[]> {
        const ac = await this.paymentrepo.find({
            relations: { items: true },
            where: { id: id },
        });
        return this.paymentItemMapper.toDto(ac[0].items);
    }

    async findTaxes(id: string): Promise<TaxDTO[]> {
        const ac = await this.paymentrepo.find({
            relations: { taxes: true },
            where: { id: id },
        });
        return this.paymentTaxMapper.toDto(ac[0].taxes);
    }

    @Cron('*/30 * * * * *') //--- IGNORE ---
    async checkAndUpdateWaitingPayments() {
        const waitingPayments = await this.paymentrepo.find({
            where: { paymentStatus: 'WAITING' },
        });
        if (waitingPayments.length === 0) {
            // exec('kdialog --title "Postral" --passivepopup "No waiting payments to check." 5');
            return;
        }
        for (const payment of waitingPayments) {
            await this.updatePaymentByOperationStatuses(payment.id, true);
        }
        // exec(`kdialog --title "Postral" --passivepopup "Checked waiting payments. ${waitingPayments.length} payments checked." 5`);

    }

    async findPaymentById(id: string, full: true): Promise<PaymentFullDTO>;
    async findPaymentById(id: string, full?: false): Promise<PaymentDTO>;
    async findPaymentById(
        id: string,
        full = false,
    ): Promise<PaymentDTO | PaymentFullDTO> {
        const paymentReal = await this.findPaymentByIdRaw(id, full);
        if (!paymentReal) {
            throw new NotFoundException('Payment not found');
        }
        const paymentItems = full
            ? this.paymentItemMapper.toDto(paymentReal!.items)
            : undefined;
        const paymentTaxes = full
            ? this.paymentTaxMapper.toDto(paymentReal!.taxes)
            : undefined;
        const p = {
            ...this.paymentMapper.toDto(paymentReal!),
            items: paymentItems,
            taxes: paymentTaxes,
        };
        return p;
    }

    private async findPaymentByIdRaw(
        id: string,
        full = false,
    ): Promise<Optional<Payment>> {
        return await this.paymentrepo.findOne({
            where: { id },
            relations: full ? ['items', 'taxes'] : [],
        });
    }


    async createRefundPayment(refundRequest: RefundRequestDTO) {
        if (refundRequest.status === 'APPROVED') {
            throw new Error('Refund request is already approved. Cannot create refund payment again.');
        }
        const originalPayment = await this.findPaymentByIdRaw(refundRequest.paymentId, true);
        if (!originalPayment) {
            throw new NotFoundException('Original payment not found for refund generation');
        }

        const paymentInit = new PaymentInitDTO({
            type: 'REFUND',
            currency: originalPayment.currency,
            customerAccountId: originalPayment.customerAccountId,
            refundRequestId: refundRequest.id,
            items: refundRequest.items.map((item) => {
                const pi = new PaymentItemDto({
                    itemId: item.realItemId,
                    variation: item.variation,
                    quantity: item.refundCount,
                    unitAmount: item.unitAmount,
                    totalAmount: item.refundAmount,
                    taxPercent: item.refundTaxAmount && item.refundAmount ? (item.refundTaxAmount / item.refundAmount) * 100 : 0,
                    sellerAccountId: refundRequest.requestedToPaymentAccountId,

                });

                return pi;
            })
        });

        const entity = await this.generateEntityFromInitDto(paymentInit);
        entity.paymentStatus = "WAITING";
        const paymentSaved = await this.paymentrepo.save(entity);
        await this.postPaymentOperation(paymentSaved);

        await this.paymentOperationManagementService.startRefundPaymentOperationsForRefundRequest(
            refundRequest,
            await this.findPaymentById(paymentSaved.id, true) as PaymentFullDTO,
            await this.findPaymentById(refundRequest.paymentId, true) as PaymentFullDTO
        );

        const paymentDtoFinal = this.paymentMapper.toDto(paymentSaved);
        return paymentDtoFinal;
        // return await this.init(paymentInit);
    }

    private async postPaymentOperation(paymentSaved: Payment) {
        await this.generateSellerPaymentOrders(paymentSaved);
        // TODO: Belki itemler içinde boş olabilir diye şimdilik idden full çekip öyle gönderiyorum... İleride optimize edilebilir.
        await this.generateAccountPaymentTransactions(paymentSaved.id);
    }


    async generateAccountPaymentTransactions(paymentId: string) {
        const payment = await this.findPaymentById(paymentId, true) as PaymentFullDTO;
        this.accountPaymentTransactionService.fromPayment(payment);
    }


    async generateSellerPaymentOrders(paymentReal: Payment) {

        let items: PaymentItemDto[] = [];
        if (paymentReal.items?.length > 0) {
            items = this.paymentItemMapper.toDto(paymentReal.items);
        } else {
            items = await this.findItems(paymentReal.id);
        }
        const transactions: SellerPaymentOrderDTO[] = [];
        for (let index = 0; index < items.length; index++) {
            const paymentItem = items[index];
            const transaction = this.transactionMapper.fromPaymentItem(paymentItem, paymentReal);
            transactions.push(transaction);
        }

        return await this.sellerPaymentOrderService.addSellerPaymentOrders(transactions);
    }

    async init(pdto: PaymentInitDTO): Promise<PaymentDTO> {
        const p = await this.generateEntityFromInitDto(pdto);
        const paymentSaved = await this.paymentrepo.save(p);
        const paymentDtoFinal = this.paymentMapper.toDto(paymentSaved);
        try {
            await this.eventSenderService.onPaymentInitialized(paymentDtoFinal);
        } catch (error) {
            console.error(error);
        }
        return paymentDtoFinal;
    }

    private async generateEntityFromInitDto(pdto: PaymentInitDTO) {
        const customerAccountId = pdto.customerAccountId; // TOOD: Auth'd user id gelmeli...
        const customerAccount = await this.accountService.fetchOne(customerAccountId);
        if (pdto.type === "REFUND" && !pdto.refundRequestId) {
            throw new BadRequestException('Refund request ID is required for REFUND type');
        }
        if (!customerAccount) {
            throw new NotFoundException(
                'Customer account not found for payment init'
            );
        }

        if (pdto.saleMode === undefined || pdto.saleMode.trim() === '') {
            pdto.saleMode = 'DEFAULT';
        }

        let taxesFromItems: TaxDTO[] = [], items: PostralPaymentItem[] = [];
        // transactions: {[sourceAccountId: string]: PaymentTransactionDTO} = {};
        let totalAmt = 0, taxTotal = 0;

        const calculationResult = await this.calcService.calculateTotalAmount({
            items: pdto.items,
            saleMode: pdto.saleMode,
            currency: pdto.currency,
        });

        totalAmt = calculationResult.totalAmount;
        taxTotal = calculationResult.totalTaxAmount;
        taxesFromItems = calculationResult.taxes;

        items = calculationResult.items.map((ci) => this.paymentItemMapper.toEntity(ci));

        const p = new Payment();
        p.type = pdto.type;
        p.currency = pdto.currency;
        p.totalAmount = totalAmt;
        p.taxAmount = taxTotal;
        p.items = items;
        p.customerAccountId = customerAccountId;
        p.customerAccountName = customerAccount.name;
        p.refundRequestId = pdto.refundRequestId;
        p.paymentStatus = 'INITIATED';
        p.taxes = TaxCalculationUtil.mergeTaxesByPercent(taxesFromItems).map((a) => this.paymentTaxMapper.toEntity(a));
        return p;
    }

    async cancelPayment(id: string) {
        let payment = await this.findPaymentByIdRaw(id);
        if (!payment) {
            throw new NotFoundException('Payment not found');
        }
        this.assertPaymentIsNotResolved(payment);
        await this.paymentOperationManagementService.cancelPaymentOperationsByPaymentId(
            id,
        );
        payment.paymentStatus = 'FAILED';
        payment.errorStatus = 'CANCELLED';
        payment = await this.paymentrepo.save(payment);
        const dto = this.paymentMapper.toDto(payment);
        this.paymentStream.next(dto);
        return dto;
    }

    private assertPaymentIsNotResolved(payment: Payment) {
        if (
            payment.paymentStatus === 'COMPLETED' ||
            payment.paymentStatus === 'FAILED'
        ) {
            throw new Error(
                'Payment is already resolved and cannot be cancelled again.',
            );
        }
    }

    async startPaymentOperation(
        id: string,
        captureInfo: PaymentCaptureInfoDTO,
    ) {
        let payment = await this.findPaymentByIdRaw(id, true);
        if (!payment) {
            throw new NotFoundException('Payment not found');
        }
        this.assertPaymentIsNotResolved(payment);

        const paymentItems = this.paymentItemMapper.toDto(payment.items); //await this.findItems(id);
        const paymentTaxes = this.paymentTaxMapper.toDto(payment.taxes); //await this.findTaxes(id);

        const result =
            await this.paymentOperationManagementService.startPaymentOperation({
                ...this.paymentMapper.toDto(payment),
                items: paymentItems,
                taxes: paymentTaxes,
                captureInfo: captureInfo,
            });
        payment.paymentStatus = 'WAITING';
        payment = await this.paymentrepo.save(payment);
        const dto = this.paymentMapper.toDto(payment);
        this.paymentStream.next(dto);
        return result;
    }

    // Güncellenmiş ödeme operasyon durumlarına göre ödemeyi günceller
    // checkOperations=false: operasyon durumları zaten güncel (cron'dan geliyorsa)
    // checkOperations=true: önce operasyonları güncelle, sonra ödemeyi kontrol et (webhook'tan geliyorsa)
    async updatePaymentByOperationStatuses(id: string, validatePaymentOperationsInChannelWrapServices = false) {
        let payment = await this.findPaymentByIdRaw(id);
        if (!payment) {
            throw new NotFoundException('Payment not found');
        }

        if (
            payment.paymentStatus === 'COMPLETED' ||
            payment.paymentStatus === 'FAILED'
        ) {
            return this.paymentMapper.toDto(payment);
        }

        if (validatePaymentOperationsInChannelWrapServices) {
            await this.paymentOperationManagementService.checkAndUpdateOperationStatuses(
                id,
            );
        }

        // Toplam ödenen veya yetkilendirilen miktarı hesapla
        const paidAmount =
            await this.paymentOperationManagementService.totalPaidOrAuthorizedOf(
                id,
            );

        if (paidAmount >= payment.totalAmount) {
            payment.paymentStatus = 'COMPLETED';
        }

        payment = await this.paymentrepo.save(payment);
        const dto = this.paymentMapper.toDto(payment);
        this.paymentStream.next(dto);

        if (payment.paymentStatus === 'COMPLETED') {
            // Ödeme tamamlandıysa, yetkilendirilmiş ödemeleri tetikle
            await this.paymentOperationManagementService.firePaymentOperationsByPaymentId(
                id,
            );
            await this.postPaymentOperation(payment);
            const fullDto = await this.findPaymentById(payment.id, true) as PaymentFullDTO;
            await this.reportService.insertPaymentToReportDigestionQueue(fullDto);
        }

        return dto;
    }

    async handlePaymentOperationStatusUpdated(operationId: string) {
        await this.paymentOperationManagementService.checkAndUpdateOperationStatusByOpId(operationId);
        const operation =
            await this.paymentOperationManagementService.findOperationById(
                operationId,
            );
        if (!operation) {
            throw new NotFoundException('Payment operation not found');
        }

        // validatePaymentOperationsInChannelWrapServices=false: operasyon zaten yukarıda güncellendi
        await this.updatePaymentByOperationStatuses(operation.paymentId, false);
    }
}
