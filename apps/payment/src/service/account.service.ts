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
import { Account } from '../entity';
import { AccountDTO, AccountSearchParamsDTO } from '@tk-postral/payment-common';
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
    ) {
        super(new TypeormRepositoryWrap<Account, string>(repo));
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
            ids = await lastValueFrom(
                this.eoService.searchOwnershipEntityIdsByUser({
                    entityGroup: PostralConstants.ENTITY_GROUP_POSTRAL,
                    entityName: PostralConstants.ENTITY_NAME_ACCOUNT,

                    capabilityAtLeastOne: ['OWNER', 'EDITOR', 'VIEWER'],
                    ...(s?.entityOwnershipGroupId != null
                        ? { entityOwnershipGroupId: s.entityOwnershipGroupId }
                        : { userId: u!.id }),
                }),
            );
        }

        const where: any = {};
        if (s?.name) {
            where.name = s.name;
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
        if (s?.ownerUserId) {
            where.ownerUserId = s.ownerUserId;
        }
        if (s?.entityOwnershipGroupId) {
            where.entityOwnershipGroupId = s.entityOwnershipGroupId;
        }
        // exec(
        //     `kdialog --msgbox "Account IDs from EO Service: ${JSON.stringify(ids)}"`,
        // );
        if (ids != null && ids.length > 0) {
            where.id = In(this.uuidStringToBinArray(ids));
        }

        return where;
    }
    uuidStringToBinArray(
        ids: string[],
    ): readonly unknown[] | import('typeorm').FindOperator<unknown> {
        return ids.map((id) =>
            Buffer.from(id.replace(/-/g, ''), 'hex').toString(),
        );
    }
    // binToUuidArray(ids: string[]): readonly unknown[] | import("typeorm").FindOperator<unknown> {
    //     return ids.map((id) => Buffer.from(id, 'hex'));
    // }
}
