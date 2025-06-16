import { Injectable, Post } from '@nestjs/common';
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
} from '@tk-postral/payment-common';
import { ItemService } from './item.service';

@Injectable()
export class PaymentService {
    constructor(
        @InjectRepository(Payment)
        private readonly paymentrepo: Repository<Payment>,
        private paymentMapper: PaymentMapper,
        private paymentItemMapper: PaymentItemMapper,
        private ems: EventManagementService,
        private itemService: ItemService,
    ) {}

    async findAll(): Promise<Payment[]> {
        return this.paymentrepo.find();
    }

    async findItems(id: string): Promise<PaymentItemDto[]> {
        const ac = await this.paymentrepo.find({
            relations: { items: true },
            where: { id: id },
        });
        return this.paymentItemMapper.toDto(ac[0].items);
    }

    async findPaymentById(id: string) {
        const paymentReal = await this.paymentrepo.find({
            where: { id },
            // relations: detailed ? ['items', 'taxes'] : [],
        });
        const p = this.paymentMapper.toDto(paymentReal[0]!);
        return p;
    }

    async init(pdto: PaymentInitDTO): Promise<PaymentDTO> {
        let taxesFromItems: TaxDTO[] = [],
            items: PostralPaymentItem[] = [];
        let totalAmt = 0;

        for (let itemIndex = 0; itemIndex < pdto.items.length; itemIndex++) {
            const itemDto = pdto.items[itemIndex];

            const itemx = (
                await this.itemService.fetchAll(
                    itemDto.itemId
                        ? { id: itemDto.itemId }
                        : {
                              entityGroup: itemDto.entityGroup,
                              entityId: itemDto.entityId,
                              entityName: itemDto.entityName,
                          },
                )
            )[0];

            totalAmt += itemDto.totalAmount;
            const taxDto = TaxCalculationUtil.generateTaxDto(
                itemx.taxPercent.toString(),
                itemDto.totalAmount,
                itemDto.taxPercent,
            );
            taxesFromItems.push(taxDto);

            const item = new PostralPaymentItem();
            item.entityGroup = itemx.entityGroup;
            item.entityId = itemx.entityId;
            item.entityName = itemx.entityName;
            item.itemId = itemx.id;
            item.name = itemx.name;
            item.unitAmount = itemx.unitAmount;
            item.totalAmount = itemx.unitAmount * itemDto.quantity;
            item.taxAmount = taxDto.taxAmount!;
            item.taxPercent = taxDto.percent!;
            item.unTaxAmount = taxDto.untaxAmount!;
            item.quantity = itemDto.quantity;
            item.originalUnitAmount = itemDto.totalAmount;
            items.push(item);
        }

        const p = new Payment();
        p.type = pdto.type;
        p.currency = pdto.currency;
        p.totalAmount = totalAmt;
        p.items = items;
        p.taxes = TaxCalculationUtil.mergeTaxesByPercent(taxesFromItems).map(
            (a) => {
                const ppt = new PostralPaymentTax();
                ppt.fullAmount = a.fullAmount;
                ppt.percent = a.percent;
                ppt.taxAmount = a.taxAmount;
                ppt.untaxAmount = a.untaxAmount;
                return ppt;
            },
        );
        const paymentSaved = await this.paymentrepo.save(p);
        const paymentDtoFinal = this.paymentMapper.toDto(paymentSaved);
        try {
            await this.ems.onPaymentInitialized(paymentDtoFinal);
        } catch (error) {
            console.error(error);
        }
        return paymentDtoFinal;
    }
}
