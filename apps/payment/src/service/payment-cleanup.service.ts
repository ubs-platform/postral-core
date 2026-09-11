import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
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
import { DataSource, In, Repository } from 'typeorm';
import { createHash, randomUUID } from 'crypto';
import { createReadStream } from 'fs';
import { mkdir, readFile, readdir, stat, writeFile } from 'fs/promises';
import { join } from 'path';
import { spawn } from 'child_process';

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

export interface PaymentArchiveManifest {
    id: string;
    dumpPath: string;
    checksum: string;
    createdAt: string;
    before?: string;
    paymentCount: number;
}

export interface PaymentArchiveSummary {
    id: string;
    checksum: string;
    createdAt: string;
    before?: string;
    paymentCount: number;
    available: boolean;
}

export interface PaymentCleanupRequest extends PaymentCleanupOptions {
    archiveId: string;
    confirmation: string;
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
        private readonly dataSource: DataSource,
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
            postral_payment_event: await this.countPaymentEvents(this.paymentEventRepository, paymentIds, options.before),
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
                'postral.admin.warning.report-queries-preserved',
                'postral.admin.warning.reports-may-be-empty',
                'postral.admin.warning.live-accounts-preserved',
                'postral.admin.warning.preview-only',
            ],
        };
    }

    async createArchive(options: PaymentCleanupOptions = {}): Promise<PaymentArchiveManifest> {
        const preview = await this.preview(options);
        const archiveDirectory = process.env.POSTRAL_ARCHIVE_DIRECTORY || '/tmp/postral-payment-archives';
        await mkdir(archiveDirectory, { recursive: true, mode: 0o700 });

        const id = randomUUID();
        const dumpPath = join(archiveDirectory, `${id}.sql`);
        await this.runMysqldump(dumpPath);
        const checksum = await this.calculateChecksum(dumpPath);
        const manifest: PaymentArchiveManifest = {
            id,
            dumpPath,
            checksum,
            createdAt: new Date().toISOString(),
            ...(options.before ? { before: options.before } : {}),
            paymentCount: preview.paymentIds.length,
        };
        await writeFile(join(archiveDirectory, `${id}.json`), JSON.stringify(manifest, null, 2), {
            encoding: 'utf8',
            mode: 0o600,
        });
        return manifest;
    }

    async getArchiveStream(archiveId: string): Promise<{ stream: NodeJS.ReadableStream; fileName: string }> {
        const manifest = await this.readManifest(archiveId);
        await this.assertArchiveIntact(manifest);
        return { stream: createReadStream(manifest.dumpPath), fileName: `${manifest.id}.sql` };
    }

    async listArchives(): Promise<PaymentArchiveSummary[]> {
        this.assertEnabled();
        const archiveDirectory = this.getArchiveDirectory();
        let entries: string[];
        try {
            entries = await readdir(archiveDirectory);
        } catch {
            return [];
        }

        const manifests = await Promise.all(
            entries
                .filter(entry => entry.endsWith('.json'))
                .map(async entry => {
                    try {
                        const manifest = JSON.parse(
                            await readFile(join(archiveDirectory, entry), 'utf8'),
                        ) as PaymentArchiveManifest;
                        await this.assertArchiveIntact(manifest);
                        return {
                            id: manifest.id,
                            checksum: manifest.checksum,
                            createdAt: manifest.createdAt,
                            ...(manifest.before ? { before: manifest.before } : {}),
                            paymentCount: manifest.paymentCount,
                            available: true,
                        };
                    } catch {
                        return undefined;
                    }
                }),
        );
        return manifests
            .filter((manifest): manifest is PaymentArchiveSummary => manifest !== undefined)
            .sort((left, right) => right.createdAt.localeCompare(left.createdAt));
    }

    async cleanup(request: PaymentCleanupRequest): Promise<PaymentCleanupPreview> {
        this.assertEnabled();
        if (request.confirmation !== 'DELETE_PAYMENT_DATA') {
            throw new BadRequestException('Type DELETE_PAYMENT_DATA to confirm payment cleanup.');
        }
        const manifest = await this.readManifest(request.archiveId);
        await this.assertArchiveIntact(manifest);
        const preview = await this.preview({ before: request.before ?? manifest.before });
        if (preview.paymentIds.length !== manifest.paymentCount) {
            throw new BadRequestException('The archive manifest does not match the current cleanup scope.');
        }

        const queryRunner = this.dataSource.createQueryRunner();
        await queryRunner.connect();
        await queryRunner.startTransaction();
        try {
            const paymentIds = preview.paymentIds;
            const reportIds = preview.affectedReportIds;
            if (reportIds.length > 0) {
                await queryRunner.manager.delete(ReportTaxGroup, { reportId: In(reportIds) });
                await queryRunner.manager.delete(ReportExpense, { reportId: In(reportIds) });
                await queryRunner.manager.delete(ReportPaymentRelation, { reportId: In(reportIds) });
                await queryRunner.manager.delete(Report, { id: In(reportIds) });
            }
            if (paymentIds.length > 0) {
                await queryRunner.manager.delete(RefundRequestItem, {
                    refundRequestId: In(await this.findRefundRequestIds(paymentIds)),
                });
                await queryRunner.manager.delete(RefundRequest, { paymentId: In(paymentIds) });
                await queryRunner.manager.delete(AccountPaymentTransaction, { paymentId: In(paymentIds) });
                await queryRunner.manager.delete(PaymentChannelOperation, { paymentId: In(paymentIds) });
                await queryRunner.manager.delete(PostralPaymentEvent, { aggregateId: In(paymentIds) } as any);
                await queryRunner.manager.delete(Invoice, { paymentId: In(paymentIds) });
                await queryRunner.manager.delete(SellerPaymentOrder, { paymentId: In(paymentIds) });
                await queryRunner.manager.delete(PostralPaymentItem, { paymentId: In(paymentIds) } as any);
                await queryRunner.manager.delete(PostralPaymentTax, { paymentId: In(paymentIds) } as any);
                await queryRunner.manager.delete(Payment, { id: In(paymentIds) });
            }
            await queryRunner.commitTransaction();
            return preview;
        } catch (error) {
            await queryRunner.rollbackTransaction();
            throw error;
        } finally {
            await queryRunner.release();
        }
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

    private async countPaymentEvents(
        repository: Repository<PostralPaymentEvent>,
        paymentIds: string[],
        before?: string,
    ): Promise<number> {
        if (paymentIds.length === 0) return 0;

        const query = repository
            .createQueryBuilder('event')
            .where('event.aggregateId IN (:...paymentIds)', { paymentIds });
        if (before) {
            query.andWhere('event.occurredAt < :before', { before: this.parseBefore(before) });
        }
        return query.getCount();
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

    private parseBefore(before: string): Date {
        const date = new Date(before);
        if (Number.isNaN(date.getTime())) {
            throw new BadRequestException('before must be a valid ISO date.');
        }
        return date;
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

    private async findRefundRequestIds(paymentIds: string[]): Promise<string[]> {
        if (paymentIds.length === 0) return [];
        const requests = await this.refundRequestRepository.find({ where: { paymentId: In(paymentIds) } });
        return requests.map(request => request.id);
    }

    private async runMysqldump(dumpPath: string): Promise<void> {
        const args = [
            '--single-transaction',
            '--skip-lock-tables',
            '--host', process.env.POSTRAL_DB_HOST || 'localhost',
            '--port', String(process.env.POSTRAL_DB_PORT || 3306),
            '--user', process.env.POSTRAL_DB_USER || 'root',
            '--result-file', dumpPath,
            process.env.POSTRAL_DB_NAME || 'postral_core',
        ];
        await new Promise<void>((resolve, reject) => {
            const childProcess = spawn('mysqldump', args, {
                env: { ...processEnv(), MYSQL_PWD: process.env.POSTRAL_DB_PASSWORD || '' },
                stdio: ['ignore', 'ignore', 'pipe'],
            });
            let errorOutput = '';
            childProcess.stderr.on('data', chunk => {
                errorOutput += chunk.toString();
            });
            childProcess.on('error', reject);
            childProcess.on('close', code => {
                if (code === 0) resolve();
                else reject(new BadRequestException(`mysqldump failed: ${errorOutput.trim() || `exit code ${code}`}`));
            });
        });
    }

    private async calculateChecksum(filePath: string): Promise<string> {
        const content = await readFile(filePath);
        return createHash('sha256').update(content).digest('hex');
    }

    private async readManifest(archiveId: string): Promise<PaymentArchiveManifest> {
        if (!/^[0-9a-f-]{36}$/i.test(archiveId)) {
            throw new BadRequestException('Invalid payment archive ID.');
        }
        try {
            return JSON.parse(await readFile(join(this.getArchiveDirectory(), `${archiveId}.json`), 'utf8')) as PaymentArchiveManifest;
        } catch {
            throw new NotFoundException('Payment archive manifest not found.');
        }
    }

    private getArchiveDirectory(): string {
        return process.env.POSTRAL_ARCHIVE_DIRECTORY || '/tmp/postral-payment-archives';
    }

    private async assertArchiveIntact(manifest: PaymentArchiveManifest): Promise<void> {
        try {
            await stat(manifest.dumpPath);
        } catch {
            throw new BadRequestException('Payment archive dump is missing.');
        }
        const checksum = await this.calculateChecksum(manifest.dumpPath);
        if (checksum !== manifest.checksum) {
            throw new BadRequestException('Payment archive checksum does not match its manifest.');
        }
    }
}

function processEnv(): NodeJS.ProcessEnv {
    return { ...process.env };
}
