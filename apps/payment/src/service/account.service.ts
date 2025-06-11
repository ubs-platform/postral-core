import { Injectable, NotFoundException, Post } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Payment } from '../entity/payment.entity';
import { Repository } from 'typeorm';
import { PostralPaymentItem } from '../entity/payment-item.entity';
import { PaymentMapper } from '../mapper/payment.mapper';
import { PaymentItemMapper } from '../mapper/payment-item.mapper';
import { TaxCalculationUtil } from '../util/calculations';
import { PostralPaymentTax } from '../entity/payment-tax.entity';
import { EventManagementService } from './event-management.service';
import {
    PaymentItemDto,
    PaymentInitDTO,
    PaymentDTO,
    TaxDTO,
    AccountDTO,
} from '@tk-postral/payment-common';
import { Account } from '../entity/account.entity';
import { AccountMapper } from '../mapper/account.mapper';
import { NotFoundError } from 'rxjs';

@Injectable()
export class AccountService {
    constructor(
        @InjectRepository(Account)
        private readonly accountRepo: Repository<Account>,
        private readonly accountMapper: AccountMapper,
    ) {}

    async fetchAll() {
        return this.accountMapper.toDtoList(await this.accountRepo.find());
    }

    async fetchOne(id: string) {
        let exist = await this.accountRepo.findOne({ where: { id } });
        if (exist) {
            return await this.accountMapper.toDto(exist);
        } else {
            throw new NotFoundException('Account');
        }
    }

    async delete(id: string) {
        await this.accountRepo.delete({ id });
    }

    async add(dto: AccountDTO) {
        await this.accountRepo.insert(
            await this.accountMapper.updateEntity(new Account(), dto),
        );
    }

    async edit(dto: AccountDTO) {
        let exist = await this.accountRepo.findOne({ where: { id: dto.id } });
        if (exist) {
            exist = await this.accountMapper.updateEntity(exist, dto);
            this.accountRepo.save(exist);
        } else {
            throw new NotFoundException('Account');
        }
    }
}
