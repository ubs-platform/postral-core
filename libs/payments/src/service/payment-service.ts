import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Payment } from '../entity/payment.entity';
import { Repository } from 'typeorm';
import { PaymentInitDTO } from '../dto/payment-init.dto';
import { PostralPaymentItem } from '../entity/payment-item.entity';
import { PaymentDTO } from '../dto/payment.dto';
import { PaymentItemDto } from '../dto/payment-item.dto';
import { PaymentMapper } from '../mapper/payment.mapper';
import { PaymentItemMapper } from '../mapper/payment-item.mapper';

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
        const p = new Payment();
        p.type = pdto.type;
        p.unit = pdto.unit;
        p.totalAmount = pdto.totalAmount;
        p.items = pdto.items.map((a) => {
            const pi = new PostralPaymentItem();
            pi.payment = p;
            pi.name = a.name;
            pi.quantity = a.quantity;
            pi.totalAmount = a.totalAmount;
            return pi;
        });
        const paymentSaved = await this.paymentrepo.save(p);
        return this.paymentMapper.toDto(paymentSaved);
    }
}
