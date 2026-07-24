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

    // ─────────────────────────────────────────────────────────────
    // Harici platform ödemesi için hesap çözümleme (bul-yoksa-oluştur).
    // ─────────────────────────────────────────────────────────────

    // Harici platform müşteri kimliğiyle eşleşen hesabı bulur.
    async findByExternalPlatformAccount(
        externalPlatformId?: string,
        externalPlatformAccountId?: string,
    ): Promise<Account | null> {
        if (!externalPlatformId || !externalPlatformAccountId) {
            return null;
        }
        return this.repo.findOne({
            where: { externalPlatformId, externalPlatformAccountId },
        });
    }

    // Kimlik alanlarıyla (name + legalIdentity + type + phone) eşleşen hesabı bulur.
    // Şifreli alanlar deterministik olduğundan DTO mapper üzerinden entity'ye çevrilir
    // ve ortaya çıkan (şifreli ya da düz) değerlerle eşitlik sorgusu yapılır.
    async findByIdentityMatch(dto: AccountDTO): Promise<Account | null> {
        const probe = await this.accountMapper.updateEntity(new Account(), dto);
        const where: any = {
            name: probe.name,
            type: probe.type,
            deactivated: false,
        };
        if (dto.legalIdentity) {
            where.legalIdentity = probe.legalIdentity;
        }
        if (dto.phone) {
            where.phone = probe.phone;
        }
        return this.repo.findOne({ where });
    }

    // Harici platform ödemesi için müşteri hesabını çözer; bulunamazsa oluşturup
    // çağıran kullanıcının (satıcının) sahipliğine bağlar. Entity döner.
    async resolveOrCreateForExternalPlatform(
        dto: AccountDTO,
        externalPlatformId: string,
        user?: UserAuthBackendDTO,
    ): Promise<Account> {
        const byExternal = await this.findByExternalPlatformAccount(
            externalPlatformId,
            dto.externalPlatformAccountId,
        );
        if (byExternal) {
            return byExternal;
        }

        const byIdentity = await this.findByIdentityMatch(dto);
        if (byIdentity) {
            return byIdentity;
        }

        const created = await this.create(
            { ...dto, externalPlatformId },
            user,
        );
        const entity = await this.repo.findOne({ where: { id: created.id } });
        if (!entity) {
            throw new Error('Failed to create customer account for external platform payment');
        }
        return entity;
    }

    // Hesabın varsayılan adresini günceller (faturalama adresini defaultAddress yapmak için).
    async updateDefaultAddress(accountId: string, addressId: string): Promise<void> {
        await this.repo.update(accountId, { defaultAddressId: addressId });
        this.invalidateSelfCache();
    }
}
