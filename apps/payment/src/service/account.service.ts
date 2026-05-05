// import { Injectable, NotFoundException, Post } from '@nestjs/common';
// import { InjectRepository } from '@nestjs/typeorm';
// import { Payment } from '../entity/payment.entity';
// import { Repository } from 'typeorm';
// import { PostralPaymentItem } from '../entity/payment-item.entity';
// import { PaymentMapper } from '../mapper/payment.mapper';
// import { PaymentItemMapper } from '../mapper/payment-item.mapper';
// import { TaxCalculationUtil } from '../util/calcs/tax-calculations';
// import { PostralPaymentTax } from '../entity/payment-tax.entity';
// import { EventSenderService } from './event-management.service';
// import {
//     PaymentItemDto,
//     PaymentInitDTO,
//     PaymentDTO,
//     TaxDTO,
//     AccountDTO,
// } from '@tk-postral/payment-common';
// import { Account } from '../entity/account.entity';
// import { AccountMapper } from '../mapper/account.mapper';
// import { NotFoundError } from 'rxjs';

import { Injectable } from '@nestjs/common';
import { Account } from '@tk-postral/postral-entities';
import { AccountDTO, AccountSearchParamsDTO, RelatedAccountFilterDto } from '@tk-postral/payment-common';
import { InjectRepository } from '@nestjs/typeorm';
import { ArrayContains, In, Repository } from 'typeorm';
import { AccountMapper } from '../mapper/account.mapper';
import { BaseCrudService } from '@ubs-platform/crud-base';
import { TypeormRepositoryWrap } from './base/typeorm-repository-wrap';
import { UserAuthBackendDTO } from '@ubs-platform/users-common';
import { EntityOwnershipService } from '@ubs-platform/users-microservice-helper';
import { PostralConstants } from '../util/consts';
import { lastValueFrom } from 'rxjs';
import { Optional } from '@ubs-platform/crud-base-common/utils';
import { exec } from 'child_process';
import { AuthUtilService } from './auth-util.service';
// import { exec } from 'child_process';

@Injectable()
export class AccountService extends BaseCrudService<
    Account,
    string,
    AccountDTO,
    AccountDTO,
    AccountSearchParamsDTO
> {
    constructor(
        @InjectRepository(Account)
        public repo: Repository<Account>,
        private readonly accountMapper: AccountMapper,
        private eoService: EntityOwnershipService,
        private authUtilService: AuthUtilService,
    ) {
        super(new TypeormRepositoryWrap<Account, string>(repo));
        // this.encryptSensitiveData().catch((e) => {
        //     console.error('Error encrypting sensitive data on service initialization:', e);
        // });
    }

    override async afterCreate(m: AccountDTO, input: AccountDTO, user?: UserAuthBackendDTO): Promise<void> {
        if (!user) {
            return Promise.resolve();
        }
        await this.authUtilService.afterCreate(
            PostralConstants.ENTITY_GROUP_POSTRAL,
            PostralConstants.ENTITY_NAME_ACCOUNT,
            m.id,
            user.id,
            input.entityOwnershipGroupId,
        );
    }

    getIdFieldNameFromInput(i: AccountDTO): string {
        return i.id;
    }

    getIdFieldNameFromModel(i: Account): string {
        return i.id;
    }

    generateNewModel(): Account {
        return new Account();
    }
    toOutput(m: Account): Promise<AccountDTO> | AccountDTO {
        return this.accountMapper.toDto(m);
    }
    moveIntoModel(model: Account, i: AccountDTO): Promise<Account> | Account {
        return this.accountMapper.updateEntity(model, i);
    }

    override async remove(
        id: string,
        user?: UserAuthBackendDTO,
    ): Promise<AccountDTO> {
        await this.repo.update(id, { deactivated: true });
        return this.fetchOne(id, user);
    }

    async searchParams(
        s?: Partial<AccountSearchParamsDTO>,
        u?: UserAuthBackendDTO,
    ): Promise<any> {
        if (!u) {
            throw new Error('User information is required for search');
        }
        let ids: Optional<string[]> = null;
        // exec(`kdialog --msgbox "Searching accounts with params: ${JSON.stringify(s)}"`);
        if (s?.admin !== 'true') {
            ids = await this.authUtilService.searchOwnedIds(
                PostralConstants.ENTITY_NAME_ACCOUNT,
                ['OWNER', 'EDITOR', 'VIEWER'],
                (s?.entityOwnershipGroupId != null
                    ? { ownershipGroupId: s.entityOwnershipGroupId }
                    : { userId: u!.id })
            );
        }

        const where: any = {};
        if (s?.name) {
            where.name = s.name;
        }
        if (s?.deactivated == 'ONLY_DEACTIVATED') {
            where.deactivated = true;
        } else if (s?.deactivated == 'NOT_DEACTIVATED') {
            // default to NOT_DEACTIVATED
            where.deactivated = false;
        }
        // if (s?.number) {
        //     where.number = s.number;
        // }
        if (s?.legalIdentity) {
            where.legalIdentity = s.legalIdentity;
        }
        if (s?.type) {
            where.type = s.type;
        }

        if (ids != null) {
            where.id = In(ids);
        }

        return where;
    }

    // binToUuidArray(ids: string[]): readonly unknown[] | import("typeorm").FindOperator<unknown> {
    //     return ids.map((id) => Buffer.from(id, 'hex'));
    // }

    async fetchManyByIds(accountIds: string[]): Promise<AccountDTO[]> {
        const pments = await this.repo.findBy({ id: In(accountIds) });
        return this.accountMapper.toDtoList(pments);
    }

    async fetchFromRelatedTransactions(
        filter: RelatedAccountFilterDto
    ): Promise<AccountDTO[]> {
        const accounts = await this.repo
            .createQueryBuilder('account')
            .where((qb) => {
                let selectQuery = `DISTINCT CASE
                            WHEN payment_transaction.sourceAccountId IN (:...relatedAccountIds)
                                THEN payment_transaction.targetAccountId
                            ELSE payment_transaction.sourceAccountId
                        END`

                if (filter.selectFrom === "SOURCE") {
                    selectQuery = `DISTINCT payment_transaction.sourceAccountId`
                } else if (filter.selectFrom === "TARGET") {
                    selectQuery = `DISTINCT payment_transaction.targetAccountId`
                }
                // exec(`kdialog --msgbox "Related account ids: ${JSON.stringify(filter.relatedAccountIds)}. Select from: ${filter.selectFrom}. Filter related account ids in: ${filter.filterRelatedAccountIdsIn}"`);
                let preSubQuery = qb
                    .subQuery()
                    .select(
                        selectQuery
                    )
                    .from('seller_payment_order', 'payment_transaction');

                if (filter.filterRelatedAccountIdsIn === "SOURCE") {
                    preSubQuery = preSubQuery.where(
                        'payment_transaction.sourceAccountId IN (:...relatedAccountIds)',
                    );
                } else if (filter.filterRelatedAccountIdsIn === "TARGET") {
                    preSubQuery = preSubQuery.where(
                        'payment_transaction.targetAccountId IN (:...relatedAccountIds)',
                    );
                } else {
                    preSubQuery = preSubQuery.where(
                        'payment_transaction.sourceAccountId IN (:...relatedAccountIds) OR payment_transaction.targetAccountId IN (:...relatedAccountIds)',
                    );
                }
                const relatedAccountIds = preSubQuery
                    .getQuery();
                return `account.id IN ${relatedAccountIds}`;
            })
            .setParameter('relatedAccountIds', filter.relatedAccountIds)
            .getMany();

        return this.accountMapper.toDtoList(accounts);
    }

    // Yüklendiği zaman şifrelenmeyen veriler şifrelensin. Bütün accountlar gelsin şifrelenmeyenleri çözmeye çalışsın eğer çözemezse hata verirse şifreleyip kaydetsin. Böylece zamanla bütün veriler şifrelenmiş olur.
    // async encryptSensitiveData() {
    //     const accounts = await this.repo.find();
    //     for (const account of accounts) {
    //         try {
    //             await this.accountMapper.toDto(account);
    //         } catch (e) {
    //             // exec(`kdialog --msgbox "Encrypting sensitive data for account ${account.id} due to error: ${e.message}"`);
    //             const resolvedWithRedacted = await this.accountMapper.toDto(account);
    //             resolvedWithRedacted.legalIdentity = account.legalIdentity;
    //             this.accountMapper.updateEntity(account, resolvedWithRedacted);
    //             await this.repo.save(account);
    //         }
    //     }
    // }
}
