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
import { AppComission } from '../entity/app-commission.entity';
import { AppComissionMapper } from '../mapper/app-comission.mapper';
import { AppComissionDTO } from '@tk-postral/payment-common/dto/app-comission.dto';

@Injectable()
export class AppComissionService {
    constructor(
        @InjectRepository(AppComission)
        private readonly accountRepo: Repository<AppComission>,
        private readonly accountMapper: AppComissionMapper,
    ) {}

    async fetchAll() {
        return this.accountMapper.toDtoList(await this.accountRepo.find());
    }

    async fetchOne(appAccountId: string, sellerAccountId?: string) {
        const where = {
            applicationAccountId: appAccountId,
            ...(sellerAccountId ? { sellerAccountId } : { default: true }),
        };
        let exist = await this.accountRepo.findOne({
            where,
        });
        if (exist) {
            return await this.accountMapper.toDto(exist);
        } else {
            const appComission = new AppComission();
            if (sellerAccountId != null) {
                this.fetchOne(appAccountId); // defaultu getirsin
            } else {
                // default yoksa %0 komisyon... daha napcaz aq
                return {} as AppComissionDTO;
            }
        }
    }

    // async delete(id: string) {
    //     await this.accountRepo.delete({ id });
    // }

    // async add(dto: AccountDTO) {
    //     await this.accountRepo.insert(
    //         await this.accountMapper.updateEntity(new Account(), dto),
    //     );
    // }

    async edit(dto: AppComissionDTO) {
        let exist = await this.accountRepo.findOne({ where: { id: dto.id } });
        if (exist) {
            exist = await this.accountMapper.updateEntity(exist, dto);
            this.accountRepo.save(exist);
        } else {
            throw new NotFoundException('Account');
        }
    }
}
