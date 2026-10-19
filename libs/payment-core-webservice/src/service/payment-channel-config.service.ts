import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { PaymentChannelConfig } from '@tk-postral/postral-entities';
import { Repository } from 'typeorm';
import { PaymentChannelConfigMapper } from '../mapper/payment-channel-config.mapper';
import { PaymentChannelConfigDTO } from '@tk-postral/payment-common';
import { SearchRequest, SearchResult } from '@ubs-platform/crud-base-common';
import { TypeormSearchUtil } from './base/typeorm-search-util';

@Injectable()
export class PaymentChannelConfigService {
    constructor(
        @InjectRepository(PaymentChannelConfig)
        private readonly repo: Repository<PaymentChannelConfig>,
        private readonly mapper: PaymentChannelConfigMapper,
    ) {}

    async fetchAll(searchReq?: SearchRequest & {channelId?:string}, excludeDevOnly = false): Promise<SearchResult<PaymentChannelConfigDTO>> {
        const filter: Record<string, any> = {};
        if (excludeDevOnly) {
            filter['devOnly'] = false;
        }
        if (searchReq?.channelId) {
            filter.channelId = searchReq.channelId;
        }
        const search = await TypeormSearchUtil.modelSearch(
            this.repo,
            searchReq?.size || 20,
            searchReq?.page || 0,
            { name: 'asc' },
            [],
            filter,
        );

        return search.map((e) => this.mapper.toDto(e));
    }

    async editOrCreate(dto: PaymentChannelConfigDTO): Promise<PaymentChannelConfigDTO> {
        let entity: PaymentChannelConfig | null = null;
        if (dto.id) {
            entity = await this.repo.findOneBy({ id: dto.id });
        }
        if (!entity) {
            entity = new PaymentChannelConfig();
        }
        this.mapper.updateEntity(entity, dto);
        await this.repo.save(entity);
        return this.mapper.toDto(entity);
    }

    async removeById(id: string): Promise<void> {
        const entity = await this.repo.findOneBy({ id });
        if (!entity) {
            throw new NotFoundException('PaymentChannelConfig not found');
        }
        await this.repo.remove(entity);
    }
}
