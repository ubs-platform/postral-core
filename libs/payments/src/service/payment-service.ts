import { Injectable, Post } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Payment } from '../entity/payment.entity';
import { Repository } from 'typeorm';
import { PaymentInitDTO } from '../dto/payment-init.dto';
import { PostralPaymentItem } from '../entity/payment-item.entity';
import { PaymentDTO } from '../dto/payment.dto';
import { PaymentItemDto } from '../dto/payment-item.dto';
import { PaymentMapper } from '../mapper/payment.mapper';
import { PaymentItemMapper } from '../mapper/payment-item.mapper';
import { TaxDTO } from '../dto/tax.dto';
import { TaxCalculationUtil } from '../util/calculations';
import { PostralPaymentTax } from '../entity/payment-tax.entity';
import { EventManagementService } from './event-management.service';

@Injectable()
export class PaymentService {
    constructor(
        @InjectRepository(Payment)
        private readonly paymentrepo: Repository<Payment>,
        private paymentMapper: PaymentMapper,
        private paymentItemMapper: PaymentItemMapper,
        private ems: EventManagementService,
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
            totalAmt += itemDto.totalAmount;
            const taxDto = TaxCalculationUtil.generateTaxDto(
                itemDto.taxPercent.toString(),
                itemDto.totalAmount,
                itemDto.taxPercent,
            );
            taxesFromItems.push(taxDto);

            const item = new PostralPaymentItem();
            item.taxAmount = taxDto.taxAmount!;
            item.taxPercent = taxDto.percent!;
            item.unTaxAmount = taxDto.untaxAmount!;
            item.quantity = itemDto.quantity;
            item.name = itemDto.name;
            item.totalAmount = itemDto.totalAmount;
            item.unitAmount = itemDto.totalAmount / itemDto.quantity;
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
