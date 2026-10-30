import {
    ConflictException,
    Inject,
    Injectable,
    Logger,
} from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import { InjectRepository } from '@nestjs/typeorm';
import type { SubMerchantSourceDTO } from '@tk-postral/payment-common';
import { lastValueFrom, timeout } from 'rxjs';
import { Repository } from 'typeorm';
import { IyzicoClientService } from './iyzico-client.service';
import { IyzicoSubMerchant } from './iyzico-sub-merchant.entity';
import { mapSubMerchant, toUpdatePayload } from './iyzico-sub-merchant.mapper';

const SUB_MERCHANT_SOURCE_PATTERN = 'postral/account/get-sub-merchant-source';

@Injectable()
export class IyzicoSubMerchantService {
    private readonly logger = new Logger(IyzicoSubMerchantService.name);

    constructor(
        @InjectRepository(IyzicoSubMerchant)
        private readonly subMerchants: Repository<IyzicoSubMerchant>,
        private readonly client: IyzicoClientService,
        @Inject('MICROSERVICE_CLIENT') private readonly messages: ClientProxy,
    ) {}

    /**
     * Hesabın güncel verisini Postral core'dan alır; iyzico'da alt üye işyeri yoksa oluşturur,
     * gönderilen verinin özeti değiştiyse günceller ve `subMerchantKey` döner.
     */
    async ensure(accountId: string): Promise<string> {
        const source = await lastValueFrom(
            this.messages
                .send<SubMerchantSourceDTO>(SUB_MERCHANT_SOURCE_PATTERN, accountId)
                .pipe(timeout(10_000)),
        );
        const payload = mapSubMerchant(source);
        const hash = this.client.fingerprint(payload);

        const current = await this.subMerchants.findOneBy({ accountId });
        if (current?.subMerchantKey && current.payloadHash === hash) {
            return current.subMerchantKey;
        }

        await this.subMerchants
            .createQueryBuilder()
            .insert()
            .values({ accountId })
            .orIgnore()
            .execute();

        return this.subMerchants.manager.transaction(async (manager) => {
            const row = await manager.findOneOrFail(IyzicoSubMerchant, {
                where: { accountId },
                lock: { mode: 'pessimistic_write' },
            });
            // Eşzamanlı başka bir çağrı kilit beklerken işi bitirmiş olabilir.
            if (row.subMerchantKey && row.payloadHash === hash) {
                return row.subMerchantKey;
            }
            if (row.subMerchantKey && row.subMerchantType !== payload.subMerchantType) {
                throw new ConflictException(
                    'iyzico does not allow changing the sub-merchant type; register a new account instead',
                );
            }

            let key = row.subMerchantKey;
            let created = false;
            if (!key) {
                try {
                    key = await this.client.createSubMerchant(payload);
                    created = true;
                } catch (error) {
                    // Önceki bir çağrıda iyzico'da oluşup DB'ye yazılamamış olabilir.
                    key = await this.client
                        .retrieveSubMerchantKey(accountId)
                        .catch(() => {
                            throw error;
                        });
                    this.logger.warn(`iyzico sub-merchant for account ${accountId} recovered by external id`);
                }
            }
            if (!created) {
                await this.client.updateSubMerchant(key, toUpdatePayload(payload));
            }
            await manager.update(IyzicoSubMerchant, accountId, {
                subMerchantKey: key,
                subMerchantType: payload.subMerchantType,
                payloadHash: hash,
            });
            return key;
        });
    }
}
