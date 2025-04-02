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

@Injectable()
export class PaymentService {
    constructor(
        @InjectRepository(Payment)
        private readonly paymentrepo: Repository<Payment>,
        private paymentMapper: PaymentMapper,
        private paymentItemMapper: PaymentItemMapper,
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

    async init(pdto: PaymentInitDTO): Promise<PaymentDTO> {
        let taxes: TaxDTO[] = [],
            items: PostralPaymentItem[] = [],
            taxMap: Map<String, TaxDTO> = new Map();
        for (let itemIndex = 0; itemIndex < pdto.items.length; itemIndex++) {
            const itemDto = pdto.items[itemIndex];
            const taxDto = TaxCalculationUtil.generateTaxDto(
                itemDto.taxPercent.toString(),
                itemDto.totalAmount,
                itemDto.taxPercent,
            );
            taxes.push(taxDto);

            const item = new PostralPaymentItem();
            item.taxAmount = taxDto.taxAmount!;
            item.taxPercent = taxDto.percent!;
            item.unTaxAmount = taxDto.untaxAmount!;
            item.name = itemDto.name;
            item.totalAmount = item.totalAmount;
            item.unitAmount = item.unitAmount;
            item.originalUnitAmount = item.originalUnitAmount;
            items.push(item);
        }

        const p = new Payment();
        p.type = pdto.type;
        p.unit = pdto.unit;
        p.totalAmount = pdto.totalAmount;
        p.items = items;
        p.taxes;
        const paymentSaved = await this.paymentrepo.save(p);
        return this.paymentMapper.toDto(paymentSaved);
    }
}
