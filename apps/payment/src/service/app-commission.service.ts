import { Injectable, NotFoundException, Post } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Payment } from '../entity/payment.entity';
import { Repository } from 'typeorm';
import { PostralPaymentItem } from '../entity/payment-item.entity';
import { PaymentMapper } from '../mapper/payment.mapper';
import { PaymentItemMapper } from '../mapper/payment-item.mapper';
import { TaxCalculationUtil } from '../util/calcs/tax-calculations';
import { PostralPaymentTax } from '../entity/payment-tax.entity';
import { EventSenderService } from './event-management.service';
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
        private readonly appComissionRepo: Repository<AppComission>,
        private readonly appComissionMapper: AppComissionMapper,
    ) {}

    async fetchAll() {
        return this.appComissionMapper.toDtoList(
            await this.appComissionRepo.find(),
        );
    }

    async fetchOne(appAccountId: string, sellerAccountId?: string) {
        const where: any = {
            applicationAccountId: appAccountId,
            ...(sellerAccountId
                ? { default: false, sellerAccountId: sellerAccountId }
                : { default: true }),
        };

        let exist = await this.appComissionRepo.findOne({
            where,
        });
        if (exist) {
            return await this.appComissionMapper.toDto(exist);
        } else {
            if (sellerAccountId) {
                return this.fetchOne(appAccountId);
            } else {
                return await this.edit({
                    applicationAccountId: appAccountId,
                    default: true,
                    percent: 0,
                });
            }
        }
    }

    async edit(dto: AppComissionDTO) {
        if (dto.sellerAccountId == null) {
            dto.default = true;
        } else {
            dto.default = false;
        }
        if (dto.percent == null) {
            const defaultComission = await this.fetchOne(
                dto.applicationAccountId,
            );
            dto.percent = defaultComission.percent;
        }

        let exist = await this.appComissionRepo.findOne({
            where: {
                default: dto.default,
                applicationAccountId: dto.applicationAccountId,
                ...(!dto.default
                    ? { sellerAccountId: dto.sellerAccountId }
                    : {}),
            },
        });
        if (!exist) {
            exist = new AppComission();
        }
        exist = await this.appComissionMapper.updateEntity(exist, dto);
        exist = await this.appComissionRepo.save(exist);
        return await this.appComissionMapper.toDto(exist);
    }
}
