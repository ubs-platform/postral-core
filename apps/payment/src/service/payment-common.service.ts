import { Injectable, NotFoundException } from "@nestjs/common";
import { PaymentFullDTO, PaymentDTO } from "@tk-postral/payment-common";
import { Payment } from "../entity";
import { InjectRepository } from "@nestjs/typeorm";
import { PaymentMapper } from "../mapper/payment.mapper";
import { PaymentTaxMapper } from "../mapper/payment-tax.mapper";
import { PaymentItemMapper } from "../mapper/payment-item.mapper";
import { Optional } from "@ubs-platform/crud-base-common/utils";

@Injectable()
export class PaymentCommonService {

    /**
     *
     */
    constructor(
        @InjectRepository(Payment) private paymentrepo,
        private paymentMapper: PaymentMapper) {


    }
    async findPaymentByIdRaw(
        id: string,
        full = false,
    ): Promise<Optional<Payment>> {
        return await this.paymentrepo.findOne({
            where: { id },
            relations: full ? ['items', 'taxes'] : [],
        });
    }


    async findPaymentById(id: string, full: true): Promise<PaymentFullDTO>;
    async findPaymentById(id: string, full?: false): Promise<PaymentDTO>;
    async findPaymentById(
        id: string,
        full = false,
    ): Promise<PaymentDTO | PaymentFullDTO> {
        const paymentReal = await this.findPaymentByIdRaw(id, full);
        if (!paymentReal) {
            throw new NotFoundException('Payment not found');
        }
        return full ? this.paymentMapper.toFullDto(paymentReal) : this.paymentMapper.toDto(paymentReal);
    }

}