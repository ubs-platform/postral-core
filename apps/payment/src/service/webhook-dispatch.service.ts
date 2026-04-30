import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import axios from 'axios';
import { WebhookEventLog } from '../entity/webhook-event-log.entity';
import { WebhookConfigService } from './webhook-config.service';
import { CryptionUtil } from '../util/cryption-util';

export type WebhookEventType =
    | 'PAYMENT_COMPLETED'
    | 'INVOICE_UPLOADED'
    | 'INVOICE_FINALIZED';

export interface WebhookPayload {
    eventType: WebhookEventType;
    paymentId?: string;
    accountId?: string;
    sellerAccountId?: string;
    invoiceId?: string;
    occurredAt: string;
    [key: string]: unknown;
}

const MAX_RETRY_COUNT = 3;
const RETRY_DELAY_SECONDS = 60;

@Injectable()
export class WebhookDispatchService {
    private readonly logger = new Logger(WebhookDispatchService.name);

    constructor(
        @InjectRepository(WebhookEventLog)
        private readonly webhookEventLogRepo: Repository<WebhookEventLog>,
        private readonly webhookConfigService: WebhookConfigService,
        private readonly cryptionUtil: CryptionUtil,
    ) {}

    /**
     * Belirtilen accountId'ye ait webhook konfigürasyonuna event gönderir.
     * Her deneme WebhookEventLog'a kaydedilir. Başarısız olursa
     * retryCount artar; retryCount >= MAX_RETRY_COUNT ise bir daha denenmez.
     */
    async send(
        accountId: string,
        eventType: WebhookEventType,
        payload: Omit<WebhookPayload, 'eventType' | 'occurredAt'>,
    ): Promise<void> {
        const config = await this.webhookConfigService.findRawByAccountId(accountId);

        if (!config || !config.isEnabled) {
            return;
        }

        const fullPayload: WebhookPayload = {
            ...payload,
            eventType,
            occurredAt: new Date().toISOString(),
        };

        const payloadStr = JSON.stringify(fullPayload);

        // Mevcut log kaydı var mı? (retry senaryosu için dışarıdan çağrılmıyor,
        // bu metot her seferinde yeni log oluşturur)
        const log = this.webhookEventLogRepo.create({
            webhookConfigId: config.id,
            eventType,
            payload: payloadStr,
            retryCount: 0,
        });

        await this.webhookEventLogRepo.save(log);
        await this.attemptDelivery(log, config.url, config.method, config.eventKey, payloadStr);
    }

    /**
     * retryAfter süresi geçmiş bekleyen logları yeniden gönderir.
     * Scheduler veya manuel tetikleme ile çağrılabilir.
     */
    async retryPending(): Promise<void> {
        const now = new Date();
        const pendingLogs = await this.webhookEventLogRepo
            .createQueryBuilder('log')
            .innerJoinAndSelect('log.webhookConfig', 'config')
            .where('log.deliveredAt IS NULL')
            .andWhere('log.retryCount < :max', { max: MAX_RETRY_COUNT })
            .andWhere('(log.retryAfter IS NULL OR log.retryAfter <= :now)', { now })
            .getMany();

        for (const log of pendingLogs) {
            const config = log.webhookConfig;
            if (!config?.isEnabled) continue;
            await this.attemptDelivery(log, config.url, config.method, config.eventKey, log.payload);
        }
    }

    private async attemptDelivery(
        log: WebhookEventLog,
        url: string,
        method: 'POST' | 'PUT',
        encryptedEventKey: string,
        payloadStr: string,
    ): Promise<void> {
        // TODO: eventKey DB'den decrypt edilmeli — CryptionUtil.decryptWithConfig kullan
        const eventKey = this.cryptionUtil.decryptWithConfig(encryptedEventKey, 'USE_DEFAULT') as string;

        try {
            const response = await axios({
                method: method.toLowerCase() as 'post' | 'put',
                url,
                headers: {
                    'Content-Type': 'application/json',
                    'x-event-key': eventKey,
                },
                data: payloadStr,
                timeout: 10_000,
            });

            log.statusCode = response.status;
            log.responseBody = JSON.stringify(response.data)?.substring(0, 2000);
            log.deliveredAt = new Date();
        } catch (err: any) {
            const status: number | undefined = err?.response?.status;
            const body: string | undefined = err?.response?.data
                ? JSON.stringify(err.response.data).substring(0, 2000)
                : err?.message;

            log.statusCode = status;
            log.responseBody = body;
            log.retryCount += 1;

            if (log.retryCount < MAX_RETRY_COUNT) {
                const retryAfter = new Date();
                retryAfter.setSeconds(retryAfter.getSeconds() + RETRY_DELAY_SECONDS);
                log.retryAfter = retryAfter;
                this.logger.warn(
                    `Webhook delivery failed for log ${log.id} (attempt ${log.retryCount}). ` +
                    `Retry after ${retryAfter.toISOString()}. Status: ${status}`,
                );
            } else {
                this.logger.error(
                    `Webhook delivery permanently failed for log ${log.id} after ${log.retryCount} attempts. ` +
                    `Status: ${status}`,
                );
            }
        }

        await this.webhookEventLogRepo.save(log);
    }
}
