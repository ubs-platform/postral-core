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
    PaymentTransactionSearchDTO,
    PaymentTransactionSearchPaginationDTO,
} from '@tk-postral/payment-common';
import { TypeormSearchUtil } from './base/typeorm-search-util';
import { EntityOwnershipService } from '@ubs-platform/users-microservice-helper';
import { UserAuthBackendDTO } from '@ubs-platform/users-common';
import { PostralConstants } from '../util/consts';
import { lastValueFrom } from 'rxjs';
import { AccountMapper } from '../mapper/account.mapper';
import { AccountService } from './account.service';
import { PaymentSearchFlatDTO } from '@tk-postral/payment-common';
import { TransactionMapper } from '../mapper/transaction.mapper';
import { PaymentTransaction } from '../entity';
import { PaymentTransactionDTO } from '@tk-postral/payment-common';
import { exec } from 'child_process';

@Injectable()
export class TransactionSearchService {
    constructor(
        @InjectRepository(PaymentTransaction)
        private readonly transactionRepo: Repository<PaymentTransaction>,
        private transactionMapper: TransactionMapper,

        private eoService: EntityOwnershipService,
        private accountMapper: AccountMapper,
        private accountService: AccountService
    ) { }



    async findAll(
        modelSearch: PaymentTransactionSearchDTO,
        user?: UserAuthBackendDTO,
    ): Promise<PaymentTransactionDTO[]> {
        const where = await this.searchWhereQuery(modelSearch, user);
        return (await this.transactionRepo.find({ where })).map((p) =>
            this.transactionMapper.toDto(p),
        );
    }

    async modelSearch(
        modelSearch: PaymentTransactionSearchPaginationDTO,
        user?: UserAuthBackendDTO,
    ) {
        const where = await this.searchWhereQuery(modelSearch, user);
        const sortKey = modelSearch.sortBy || 'createdAt';
        const sortOrder = modelSearch.sortRotation || 'desc';
        return (
            await TypeormSearchUtil.modelSearch<PaymentTransaction>(
                this.transactionRepo,
                modelSearch.size,
                modelSearch.page,
                { [sortKey]: sortOrder },
                [],
                where,
            )
        ).map((p) => this.transactionMapper.toDto(p));
    }



    private async searchWhereQuery(
        modelSearch: PaymentTransactionSearchDTO,
        user?: UserAuthBackendDTO,
    ) {
        const where = {};
        let orClause = [{}];
        let authorizedAccountIds: string[] = [];

        if (modelSearch.admin !== "true") {
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
            if (modelSearch.sourceAccountIds || modelSearch.targetAccountIds) {
                if (modelSearch.sourceAccountIds) {
                    const intersection = modelSearch.sourceAccountIds.split(','); //this.getIntersections(authorizedAccountIds, );
                    Object.assign(where, {
                        sourceAccountId: In(intersection),
                    });
                }

                if (modelSearch.targetAccountIds) {
                    const intersection = modelSearch.targetAccountIds.split(','); //this.getIntersections(authorizedAccountIds, );
                    Object.assign(where, {
                        targetAccountId: In(intersection),
                    });
                }
            } else {
                orClause = [
                    { sourceAccountId: In(authorizedAccountIds) },
                    { targetAccountId: In(authorizedAccountIds) },
                ];
            }

        }
        if (modelSearch.paymentStatus) {
            Object.assign(where, {
                paymentStatus: In(modelSearch.paymentStatus.split(',')),
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
        // exec(`kdialog --msgbox "Search where clause: ${JSON.stringify(where)}  admin ${modelSearch.admin}  clauses ${JSON.stringify(orClause)}  user ${user ? user.id : 'null'}"`);
        return orClause.map((clause) => ({ ...where, ...clause }));
    }

    // private getIntersections(authorizedAccountIds: string[], requestedCustomerAccountIds: string[]) {
    //     const intersection = authorizedAccountIds.filter(id => requestedCustomerAccountIds.includes(id)
    //     );
    //     if (intersection.length === 0) {
    //         // Kesişim boşsa, kullanıcı yetkili olmadığı customerAccountId ile arama yapmaya çalışıyor
    //         throw new Error('Unauthorized: No access to the specified customer accounts');
    //     }
    //     return intersection;
    // }

    // async accountIdsInPayment(search: PaymentSearchFlatDTO, user?: UserAuthBackendDTO): Promise<AccountDTO[]> {
    //     const where = await this.buildSearchWhereQuery(search, user);
    //     const payments = await this.transactionRepo.find({ where, relations: ['items'] });

    //     if (search.searchSide == "CUSTOMER") {
    //         // Müşteri tarafında bütün satın aldığı itemlerin accountları gelir. Müşterinin kendisi hariç.
    //         const accountIds = new Set<string>();
    //         payments.forEach(payment => {
    //             payment.items.forEach(item => {
    //                 if (item.entityOwnerAccountId !== search.customerAccountId) {
    //                     accountIds.add(item.entityOwnerAccountId);
    //                 }
    //             });
    //         });


    //         return this.accountService.fetchManyByIds(Array.from(accountIds));
    //     }

    //     else if (search.searchSide == "SELLER") {
    //         // Satıcı bütün müşterilerinin hesaplarını görür.
    //         const accountIds = new Set<string>();
    //         payments.forEach(payment => {
    //             accountIds.add(payment.customerAccountId);
    //         });

    //         return this.accountService.fetchManyByIds(Array.from(accountIds));
    //     }
    //     else {
    //         return [];
    //     }
    // }
}
