import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Payment } from '../entity/payment.entity';
import {
    In,
    Repository,
    MoreThanOrEqual,
    LessThanOrEqual,
    Between,
} from 'typeorm';
import { PaymentMapper } from '../mapper/payment.mapper';
import {
    PaymentDTO,
    PaymentSearchPaginationFlatDTO,
} from '@tk-postral/payment-common';
import { TypeormSearchUtil } from './base/typeorm-search-util';
import { EntityOwnershipService } from '@ubs-platform/users-microservice-helper';
import { UserAuthBackendDTO } from '@ubs-platform/users-common';
import { PostralConstants } from '../util/consts';
import { lastValueFrom } from 'rxjs';
import { Optional } from '@ubs-platform/crud-base-common/utils';

@Injectable()
export class PaymentSearchService {
    constructor(
        @InjectRepository(Payment)
        private readonly paymentrepo: Repository<Payment>,
        private paymentMapper: PaymentMapper,
        private eoService: EntityOwnershipService,
    ) { }

    async findAll(
        modelSearch: PaymentSearchPaginationFlatDTO,
        user?: UserAuthBackendDTO,
    ): Promise<PaymentDTO[]> {
        const where = await this.buildSearchWhereQuery(modelSearch, user);
        return (await this.paymentrepo.find({ where })).map((p) =>
            this.paymentMapper.toDto(p),
        );
    }

    async modelSearch(
        modelSearch: PaymentSearchPaginationFlatDTO,
        user?: UserAuthBackendDTO,
    ) {
        const where = await this.buildSearchWhereQuery(modelSearch, user);
        const sortKey = modelSearch.sortBy || 'createdAt';
        const sortOrder = modelSearch.sortRotation || 'desc';
        return (
            await TypeormSearchUtil.modelSearch<Payment>(
                this.paymentrepo,
                modelSearch.size,
                modelSearch.page,
                { [sortKey]: sortOrder },
                ["items"],
                { $match: where },
            )
        ).map((p) => this.paymentMapper.toDto(p));
    }

    private async buildSearchWhereQuery(
        modelSearch: PaymentSearchPaginationFlatDTO,
        user?: UserAuthBackendDTO,
    ) {
        const where = await this.searchWhereQuery(modelSearch, user);
        return where;
    }

    private async searchWhereQuery(
        modelSearch: PaymentSearchPaginationFlatDTO,
        user?: UserAuthBackendDTO,
    ) {

        const where = {};

        // Eğer admin değilse, sadece kendi sellerAccountId'lerinden getir
        if (user && modelSearch.admin !== 'true') {
            const sellerIdsResult = await lastValueFrom(
                this.eoService.searchOwnershipEntityIdsByUser({
                    entityGroup: PostralConstants.ENTITY_GROUP_POSTRAL,
                    entityName: PostralConstants.ENTITY_NAME_ACCOUNT,
                    capabilityAtLeastOne: ['OWNER', 'EDITOR', 'VIEWER'],
                    userId: user.id,
                }),
            );

            // sellerIds string olarak gelebiliyor, array'e dönüştür
            let sellerIds: string[] = [];
            if (Array.isArray(sellerIdsResult)) {
                sellerIds = sellerIdsResult;
            } else if (typeof sellerIdsResult === 'string') {
                sellerIds = [sellerIdsResult];
            }

            if (sellerIds && sellerIds.length > 0) {
                where["items"] = {
                    entityOwnerAccountId: In(sellerIds),
                };
            }
        }

        if (modelSearch.paymentStatus && modelSearch.paymentStatus.length > 0) {
            Object.assign(where, {
                paymentStatus: In(modelSearch.paymentStatus.split(',')),
            });
        }
        if (modelSearch.customerAccountId) {
            Object.assign(where, {
                customerAccountId: modelSearch.customerAccountId,
            });
        }
        if (
            modelSearch.sellerAccountIds &&
            modelSearch.sellerAccountIds.length > 0
        ) {
            Object.assign(where, {
                items: {
                    entityOwnerAccountId: In(modelSearch.sellerAccountIds.split(',')),
                },
            });
        }

        if (
            modelSearch.paymentChannelIds &&
            modelSearch.paymentChannelIds.length > 0
        ) {
            Object.assign(where, {
                paymentChannelId: In(modelSearch.paymentChannelIds.split(',')),
            });
        }
        if (modelSearch.dateFrom && modelSearch.dateTo) {
            Object.assign(where, {
                createdAt: Between(modelSearch.dateFrom, modelSearch.dateTo),
            });
        } else if (modelSearch.dateFrom) {
            Object.assign(where, {
                createdAt: MoreThanOrEqual(modelSearch.dateFrom),
            });
        } else if (modelSearch.dateTo) {
            Object.assign(where, {
                createdAt: LessThanOrEqual(modelSearch.dateTo),
            });
        }
        return where;
    }
}
