import { BadRequestException, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import {
    AccountPaymentTransaction,
    Invoice,
    Payment,
    PaymentChannelOperation,
    PostralPaymentEvent,
    PostralPaymentItem,
    PostralPaymentTax,
    RefundRequest,
    RefundRequestItem,
    Report,
    ReportExpense,
    ReportPaymentRelation,
    ReportQuery,
    ReportTaxGroup,
    SellerPaymentOrder,
} from '@tk-postral/postral-entities';
import { In, Repository } from 'typeorm';

export interface PaymentCleanupOptions {
    before?: string;
}

export interface PaymentCleanupPreview {
    enabled: boolean;
    before?: string;
    paymentIds: string[];
    preservedReportQueryCount: number;
    affectedReportIds: string[];
    counts: Record<string, number>;
    warnings: string[];
}

@Injectable()
export class PaymentCleanupService {
    constructor(
        @InjectRepository(Payment)
        private readonly paymentRepository: Repository<Payment>,
        @InjectRepository(PostralPaymentItem)
        private readonly paymentItemRepository: Repository<PostralPaymentItem>,
        @InjectRepository(PostralPaymentTax)
        private readonly paymentTaxRepository: Repository<PostralPaymentTax>,
        @InjectRepository(SellerPaymentOrder)
        private readonly sellerPaymentOrderRepository: Repository<SellerPaymentOrder>,
        @InjectRepository(Invoice)
        private readonly invoiceRepository: Repository<Invoice>,
        @InjectRepository(RefundRequest)
        private readonly refundRequestRepository: Repository<RefundRequest>,
        @InjectRepository(RefundRequestItem)
        private readonly refundRequestItemRepository: Repository<RefundRequestItem>,
        @InjectRepository(Report)
        private readonly reportRepository: Repository<Report>,
        @InjectRepository(ReportQuery)
        private readonly reportQueryRepository: Repository<ReportQuery>,
        @InjectRepository(ReportTaxGroup)
        private readonly reportTaxGroupRepository: Repository<ReportTaxGroup>,
        @InjectRepository(ReportExpense)
        private readonly reportExpenseRepository: Repository<ReportExpense>,
        @InjectRepository(ReportPaymentRelation)
        private readonly reportPaymentRelationRepository: Repository<ReportPaymentRelation>,
        @InjectRepository(AccountPaymentTransaction)
        private readonly accountPaymentTransactionRepository: Repository<AccountPaymentTransaction>,
        @InjectRepository(PaymentChannelOperation)
        private readonly paymentChannelOperationRepository: Repository<PaymentChannelOperation>,
        @InjectRepository(PostralPaymentEvent)
        private readonly paymentEventRepository: Repository<PostralPaymentEvent>,
    ) {}

    isEnabled(): boolean {
        return process.env.POSTRAL_ENABLE_ARCHIVE === 'true';
    }

    assertEnabled(): void {
        if (!this.isEnabled()) {
            throw new BadRequestException(
                'Payment archive and cleanup operations are disabled. Set POSTRAL_ENABLE_ARCHIVE=true.',
            );
        }
    }

    async preview(options: PaymentCleanupOptions = {}): Promise<PaymentCleanupPreview> {
        this.assertEnabled();

        const paymentIds = await this.findPaymentIds(options.before);
        const counts: Record<string, number> = {
            payment: paymentIds.length,
            postral_payment_item: await this.countByPayment(this.paymentItemRepository, paymentIds),
            postral_payment_tax: await this.countByPayment(this.paymentTaxRepository, paymentIds),
            seller_payment_order: await this.countByPayment(this.sellerPaymentOrderRepository, paymentIds),
            invoice: await this.countByPayment(this.invoiceRepository, paymentIds),
            refund_request: await this.countByPayment(this.refundRequestRepository, paymentIds),
            refund_request_item: await this.countRefundItems(paymentIds),
            account_payment_transaction: await this.countLooseReference(this.accountPaymentTransactionRepository, paymentIds),
            payment_channel_operation: await this.countLooseReference(this.paymentChannelOperationRepository, paymentIds),
            postral_payment_event: await this.countLooseReference(this.paymentEventRepository, paymentIds),
        };

        const affectedReportIds = await this.findAffectedReportIds(paymentIds);
        counts.report_payment_relation = await this.reportPaymentRelationRepository.count({
            where: paymentIds.length > 0 ? { paymentId: In(paymentIds) } : { paymentId: In(['__empty__']) },
        });
        counts.report = affectedReportIds.length;
        counts.report_tax_group = await this.countByReport(this.reportTaxGroupRepository, affectedReportIds);
        counts.report_expense = await this.countByReport(this.reportExpenseRepository, affectedReportIds);

        const preservedReportQueryCount = await this.reportQueryRepository.count();
        return {
            enabled: true,
            ...(options.before ? { before: options.before } : {}),
            paymentIds,
            preservedReportQueryCount,
            affectedReportIds,
            counts,
            warnings: [
                'ReportQuery records are preserved.',
                'Affected report output buckets may appear empty until new payments are digested.',
                'Live account, address, and bank account records are not part of this cleanup preview.',
                'Preview does not archive or delete any data.',
            ],
        };
    }

    private async findPaymentIds(before?: string): Promise<string[]> {
        let date: Date | undefined;
        if (before) {
            date = new Date(before);
            if (Number.isNaN(date.getTime())) {
                throw new BadRequestException('before must be a valid ISO date.');
            }
        }

        const query = this.paymentRepository.createQueryBuilder('payment').select('payment.id', 'id');
        if (date) {
            query.where('payment.createdAt < :before', { before: date });
        }

        const rows = await query.getRawMany<{ id: string }>();
        return rows.map(row => row.id);
    }

    private async countByPayment(
        repository: Repository<any>,
        paymentIds: string[],
    ): Promise<number> {
        if (paymentIds.length === 0) return 0;
        return repository
            .createQueryBuilder('row')
            .where('row.paymentId IN (:...paymentIds)', { paymentIds })
            .getCount();
    }

    private async countRefundItems(paymentIds: string[]): Promise<number> {
        if (paymentIds.length === 0) return 0;
        const requests = await this.refundRequestRepository.find({ where: { paymentId: In(paymentIds) } });
        if (requests.length === 0) return 0;
        return this.refundRequestItemRepository
            .createQueryBuilder('item')
            .where('item.refundRequestId IN (:...requestIds)', {
                requestIds: requests.map(request => request.id),
            })
            .getCount();
    }

    private async countLooseReference(repository: Repository<any>, paymentIds: string[]): Promise<number> {
        if (paymentIds.length === 0) return 0;
        return repository
            .createQueryBuilder('row')
            .where('row.paymentId IN (:...paymentIds)', { paymentIds })
            .getCount();
    }

    private async findAffectedReportIds(paymentIds: string[]): Promise<string[]> {
        if (paymentIds.length === 0) return [];
        const rows = await this.reportPaymentRelationRepository
            .createQueryBuilder('relation')
            .select('DISTINCT relation.reportId', 'reportId')
            .where('relation.paymentId IN (:...paymentIds)', { paymentIds })
            .getRawMany<{ reportId: string }>();
        return rows.map(row => row.reportId);
    }

    private async countByReport(
        repository: Repository<any>,
        reportIds: string[],
    ): Promise<number> {
        if (reportIds.length === 0) return 0;
        return repository
            .createQueryBuilder('row')
            .where('row.reportId IN (:...reportIds)', { reportIds })
            .getCount();
    }
}
