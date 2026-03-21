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
import { SellerPaymentOrder } from '../entity';
import { PaymentTransactionDTO } from '@tk-postral/payment-common';
import { exec } from 'child_process';
import { AuthUtilService } from './auth-util.service';

@Injectable()
export class SellerPaymentOrderSearchService {

    constructor(
        @InjectRepository(SellerPaymentOrder)
        private readonly transactionRepo: Repository<SellerPaymentOrder>,
        private transactionMapper: TransactionMapper,

        private eoService: EntityOwnershipService,
        private accountMapper: AccountMapper,
        private accountService: AccountService,
        private authUtilService: AuthUtilService,
    ) { }

    async fetchById(id: string, user?: UserAuthBackendDTO | undefined) {
        // TODO: Rol kontrolü eklenebilir. Şu an sadece authentication var. Admin olmayan kullanıcılar sadece kendi hesaplarıyla ilişkili transactionları görebilmeli.
        // this.checkAuthorizationForTransaction(id, user);
        const transaction = await this.transactionRepo.findOneBy({ id });
        if (!transaction) {
            throw new Error('Transaction not found');
        }
        return this.transactionMapper.toDto(transaction);
    }

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
            await TypeormSearchUtil.modelSearch<SellerPaymentOrder>(
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
            authorizedAccountIds = await this.fetchAccountIds(user);
            // Eğer targetAccountIds ile arama yapılacaksa, kullanıcının yetkili olduğu hesaplarla kesişen targetAccountIds'leri al
            // Aksi halde, kullanıcının yetkili olduğu tüm hesapları targetAccountIds olarak kullan
            if (modelSearch.targetAccountIds) {

                const intersection = modelSearch.targetAccountIds.split(','); //this.getIntersections(authorizedAccountIds, );
                Object.assign(where, {
                    targetAccountId: In(intersection),
                });

            } else {
                Object.assign(where, {
                    targetAccountId: In(authorizedAccountIds),
                });
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

    private async fetchAccountIds(user: UserAuthBackendDTO) {
        const authorizedAccountIds = await lastValueFrom(
            this.eoService.searchOwnershipEntityIdsByUser({
                entityGroup: PostralConstants.ENTITY_GROUP_POSTRAL,
                entityName: PostralConstants.ENTITY_NAME_ACCOUNT,
                capabilityAtLeastOne: ['OWNER', 'EDITOR', 'VIEWER'],
                userId: user.id,
            })
        );
        return authorizedAccountIds;
    }

    public async fetchByIdWithRelationsInternal(id: string) {
        const transaction = await this.transactionRepo.findOne({
            where: { id },
            relations: ['sourceAccount', 'targetAccount', "sourceAccount.defaultAddress", "targetAccount.defaultAddress"],
        });
        if (!transaction) {
            throw new Error('Transaction not found');
        }
        return transaction;
    }
}
