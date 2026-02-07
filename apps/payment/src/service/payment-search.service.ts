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
    AccountDTO,
    PaymentDTO,
    PaymentSearchPaginationFlatDTO,
} from '@tk-postral/payment-common';
import { TypeormSearchUtil } from './base/typeorm-search-util';
import { EntityOwnershipService } from '@ubs-platform/users-microservice-helper';
import { UserAuthBackendDTO } from '@ubs-platform/users-common';
import { PostralConstants } from '../util/consts';
import { lastValueFrom } from 'rxjs';
import { AccountMapper } from '../mapper/account.mapper';
import { AccountService } from './account.service';
import { PaymentSearchFlatDTO } from '@tk-postral/payment-common';
import { Optional } from '@ubs-platform/crud-base-common/utils';
import { exec } from 'child_process';

@Injectable()
export class PaymentSearchService {
    constructor(
        @InjectRepository(Payment)
        private readonly paymentrepo: Repository<Payment>,
        private paymentMapper: PaymentMapper,
        private eoService: EntityOwnershipService,
        private accountMapper: AccountMapper,
        private accountService: AccountService
    ) { }

    async findAll(
        modelSearch: PaymentSearchPaginationFlatDTO,
        user?: UserAuthBackendDTO,
    ): Promise<PaymentDTO[]> {
        const where = await this.searchWhereQuery(modelSearch, user);
        return (await this.paymentrepo.find({ where })).map((p) =>
            this.paymentMapper.toDto(p),
        );
    }

    async modelSearch(
        modelSearch: PaymentSearchPaginationFlatDTO,
        user?: UserAuthBackendDTO,
    ) {
        const where = await this.searchWhereQuery(modelSearch, user);
        const sortKey = modelSearch.sortBy || 'createdAt';
        const sortOrder = modelSearch.sortRotation || 'desc';
        return (
            await TypeormSearchUtil.modelSearch<Payment>(
                this.paymentrepo,
                modelSearch.size,
                modelSearch.page,
                { [sortKey]: sortOrder },
                ["items"],
                where,
            )
        ).map((p) => this.paymentMapper.toDto(p));
    }


    private async searchWhereQuery(
        modelSearch: PaymentSearchFlatDTO,
        user?: UserAuthBackendDTO,
    ) {
        let userRelatedAccountIds: Optional<string[]> = null;
        // Müşteri tarafı için arama yapılıyorsa, kullanıcının yetkili olduğu hesaplara göre filtreleme yapılır.
        const where = {};
        let authorizedAccountIds: string[] = [];

        if (modelSearch.searchSide !== "ADMIN") {
            if (!user) {
                throw new Error('Unauthorized');
            }

            // Kullanıcının yetkili olduğu hesapları getir
            authorizedAccountIds = await lastValueFrom(
                this.eoService.searchOwnershipEntityIdsByUser({
                    entityGroup: PostralConstants.ENTITY_GROUP_POSTRAL,
                    entityName: PostralConstants.ENTITY_NAME_ACCOUNT,
                    capabilityAtLeastOne: ['OWNER', 'EDITOR', 'VIEWER'],
                    userId: user.id,
                }),
            );

            if (modelSearch.customerAccountId &&
                modelSearch.customerAccountId.length > 0) {
                const requestedCustomerAccountIds = modelSearch.customerAccountId.split(',');
                const intersection = this.getIntersections(authorizedAccountIds, requestedCustomerAccountIds);
                if (intersection.length === 0) {
                    throw new Error('Unauthorized: No access to the specified customer accounts');
                }
                userRelatedAccountIds = intersection;
            }
            if (userRelatedAccountIds == null) {
                userRelatedAccountIds = authorizedAccountIds;
            }
        }
        // exec(`kdialog --msgbox "Authorized account ids: ${JSON.stringify(authorizedAccountIds)}  userRelatedAccountIds: ${JSON.stringify(userRelatedAccountIds)}  searchCustomerAccountId: ${modelSearch.customerAccountId}"`);
        if (userRelatedAccountIds) {
            Object.assign(where, {
                customerAccountId: In(userRelatedAccountIds),
            });
        }

        if (modelSearch.sellerAccountIds && modelSearch.sellerAccountIds.length > 0) {
            Object.assign(where, {
                items: {
                    entityOwnerAccountId: In(modelSearch.sellerAccountIds.split(',')),
                },
            });
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

    private getIntersections(authorizedAccountIds: string[], requestedCustomerAccountIds: string[]) {
        const intersection = authorizedAccountIds.filter(id => requestedCustomerAccountIds.includes(id)
        );
        if (intersection.length === 0) {
            // Kesişim boşsa, kullanıcı yetkili olmadığı customerAccountId ile arama yapmaya çalışıyor
            throw new Error('Unauthorized: No access to the specified customer accounts');
        }
        return intersection;
    }

    async accountIdsInPayment(search: PaymentSearchFlatDTO, user?: UserAuthBackendDTO): Promise<AccountDTO[]> {
        const where = await this.searchWhereQuery(search, user);
        const payments = await this.paymentrepo.find({ where, relations: ['items'] });

        if (search.searchSide == "CUSTOMER") {
            // Müşteri tarafında bütün satın aldığı itemlerin accountları gelir. Müşterinin kendisi hariç.
            const accountIds = new Set<string>();
            payments.forEach(payment => {
                payment.items.forEach(item => {
                    if (item.entityOwnerAccountId !== search.customerAccountId) {
                        accountIds.add(item.entityOwnerAccountId);
                    }
                });
            });


            return this.accountService.fetchManyByIds(Array.from(accountIds));
        }

        else if (search.searchSide == "SELLER") {
            // Satıcı bütün müşterilerinin hesaplarını görür.
            const accountIds = new Set<string>();
            payments.forEach(payment => {
                accountIds.add(payment.customerAccountId);
            });

            return this.accountService.fetchManyByIds(Array.from(accountIds));
        }
        else {
            return [];
        }
    }
}
