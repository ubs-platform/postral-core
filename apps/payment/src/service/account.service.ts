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
import { Repository } from 'typeorm';
import { AccountMapper } from '../mapper/account.mapper';
import { BaseCrudService } from '@ubs-platform/crud-base';
import { TypeormRepositoryWrap } from './base/typeorm-repository-wrap';

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

    searchParams(s?: Partial<AccountSearchParamsDTO>): Promise<any> | any {
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
        return where;
    }
}

// @Injectable()
// export class AccountService {
//     constructor(
//         @InjectRepository(Account)
//         private readonly accountRepo: Repository<Account>,
//         private readonly accountMapper: AccountMapper,
//     ) {}

//     async fetchAll() {
//         return this.accountMapper.toDtoList(await this.accountRepo.find());
//     }

//     async fetchOne(id: string) {
//         let exist = await this.accountRepo.findOne({ where: { id } });
//         if (exist) {
//             return await this.accountMapper.toDto(exist);
//         } else {
//             throw new NotFoundException('Account');
//         }
//     }

//     async delete(id: string) {
//         await this.accountRepo.delete({ id });
//     }

//     async add(dto: AccountDTO) {
//         const a = await this.accountRepo.save(
//             await this.accountMapper.updateEntity(new Account(), dto),
//         );
//         return this.accountMapper.toDto(a);
//     }

//     async edit(dto: AccountDTO) {
//         let exist = await this.accountRepo.findOne({ where: { id: dto.id } });
//         if (exist) {
//             exist = await this.accountMapper.updateEntity(exist, dto);
//             exist = await this.accountRepo.save(exist);
//             return this.accountMapper.toDto(exist);
//         } else {
//             throw new NotFoundException('Account');
//         }
//     }
// }
