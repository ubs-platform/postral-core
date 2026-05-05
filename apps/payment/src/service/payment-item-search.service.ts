import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import {
    Repository,
} from 'typeorm';
import {
    PaymentItemDto,
    PaymentItemSearchDTO,
} from '@tk-postral/payment-common';
import { PostralPaymentItem } from '@tk-postral/postral-entities';
import { PaymentItemMapper } from '../mapper/payment-item.mapper';
import { exec } from 'child_process';

@Injectable()
export class PaymentItemSearchService {
    constructor(
        @InjectRepository(PostralPaymentItem)
        private readonly paymentrepo: Repository<PostralPaymentItem>,
        private paymentItemMapper: PaymentItemMapper,
    ) { }

    async findItemsByCriteria(
        criteria: PaymentItemSearchDTO,
    ): Promise<PaymentItemDto[]> {
        const where: any = {};
        if (criteria.id) {
            where.id = criteria.id;
        }
        if (criteria.variation) {
            where.variation = criteria.variation;
        }
        if (criteria.name) {
            where.name = criteria.name;
        }
        if (criteria.paymentId) {
            where.payment = { id: criteria.paymentId };
        }
        if (criteria.sellerAccountId) {
            where.sellerAccountId = criteria.sellerAccountId;
        }
        if (criteria.entityGroup) {
            where.entityGroup = criteria.entityGroup;
        }
        if (criteria.entityId) {
            where.entityId = criteria.entityId;
        }
        // exec(`kdialog --msgbox "Criteria sellerAccountId: ${criteria.sellerAccountId}, paymentId: ${criteria.paymentId}"`);
        const items = await this.paymentrepo.find({ where });
        return this.paymentItemMapper.toDto(items);
    }

}
