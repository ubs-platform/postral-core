import { Injectable, NotFoundException } from "@nestjs/common";
import { PaymentFullDTO, PaymentDTO } from "@tk-postral/payment-common";
import { Payment } from '@tk-postral/postral-entities';
import { InjectRepository } from "@nestjs/typeorm";
import { PaymentMapper } from "../mapper/payment.mapper";
import { PaymentTaxMapper } from "../mapper/payment-tax.mapper";
import { PaymentItemMapper } from "../mapper/payment-item.mapper";
import { Optional } from "@ubs-platform/crud-base-common/utils";
import { Repository } from "typeorm";

@Injectable()
export class PaymentCommonService {

    /**
     *
     */
    constructor(
        @InjectRepository(Payment) private paymentrepo : Repository<Payment>,
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
        full: boolean = false,
    ): Promise<PaymentDTO | PaymentFullDTO> {
        const paymentReal = await this.findPaymentByIdRaw(id, full);
        if (!paymentReal) {
            throw new NotFoundException('Payment not found');
        }
        return full ? this.paymentMapper.toFullDto(paymentReal) : this.paymentMapper.toDto(paymentReal);
    }

    async findPaymentDoesntHaveReportRelation(accountId: string, reportId: string) {
        return await this.paymentrepo.createQueryBuilder(Payment.name.toLowerCase())
            .leftJoin(`${Payment.name.toLowerCase()}.items`, 'item')
            .leftJoin(
                `${Payment.name.toLowerCase()}.reportPaymentRelations`,
                'rpr',
                'rpr.reportId = :reportId',
                { reportId },
            )
            .where(`(item.sellerAccountId = :accountId OR ${Payment.name.toLowerCase()}.customerAccountId = :accountId)`, { accountId })
            .andWhere('rpr.id IS NULL')
            .distinct(true)
            .getMany();
    }


}