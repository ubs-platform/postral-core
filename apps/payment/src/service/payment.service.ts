import { Inject, Injectable, NotFoundException, Post } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Payment } from '../entity/payment.entity';
import { Repository, Transaction } from 'typeorm';
import { PostralPaymentItem } from '../entity/payment-item.entity';
import { PaymentMapper } from '../mapper/payment.mapper';
import { PaymentItemMapper } from '../mapper/payment-item.mapper';
import { TaxCalculationUtil } from '../util/calculations';
import { PostralPaymentTax } from '../entity/payment-tax.entity';
import { EventSenderService } from './event-management.service';
import {
    PaymentItemDto,
    PaymentInitDTO,
    PaymentDTO,
    TaxDTO,
    PaymentTransactionDTO,
} from '@tk-postral/payment-common';
import { ItemService } from './item.service';
import { PaymentTaxMapper } from '../mapper/payment-tax.mapper';
import { ItemPriceService } from './item-price.service';
import { PaymentCaptureInfoDTO } from '@tk-postral/payment-common/dto/capture-info.dto';
import { PaymentTransactionService } from './transaction.service';
import { PaymentChannelStatusDTO } from '@tk-postral/payment-common/dto/payment-channel-status';

@Injectable()
export class PaymentService {

    constructor(
        @InjectRepository(Payment)
        private readonly paymentrepo: Repository<Payment>,
        private paymentMapper: PaymentMapper,
        private paymentItemMapper: PaymentItemMapper,
        private paymentTaxMapper: PaymentTaxMapper,
        private eventSenderService: EventSenderService,
        private itemService: ItemService,
        private itemPriceService: ItemPriceService,
        private transactionService: PaymentTransactionService,
        @Inject('MICROSERVICE_CLIENT') private readonly kafkaClient: any,
    ) { }




    async findAllRaw(): Promise<Payment[]> {
        return this.paymentrepo.find();
    }
    async findAll(): Promise<PaymentDTO[]> {
        return (await this.findAllRaw()).map(p => this.paymentMapper.toDto(p));
    }

    async findItems(id: string): Promise<PaymentItemDto[]> {
        const ac = await this.paymentrepo.find({
            relations: { items: true },
            where: { id: id },
        });
        return this.paymentItemMapper.toDto(ac[0].items);
    }

    async findTaxes(id: string): Promise<TaxDTO[]> {
        const ac = await this.paymentrepo.find({
            relations: { taxes: true },
            where: { id: id },
        });
        return this.paymentTaxMapper.toDto(ac[0].taxes);
    }

    async findPaymentById(id: string) {
        const paymentReal = await this.findPaymentByIdRaw(id);
        const p = this.paymentMapper.toDto(paymentReal!);
        return p;
    }

    private async findPaymentByIdRaw(id: string): Promise<Payment | undefined> {
        return await this.paymentrepo.find({
            where: { id },
        })[0];
    }

    async editPaymentOperationInformation(id: string, info: PaymentChannelStatusDTO) {
        const paymentReal = await this.findPaymentByIdRaw(id);
        if (paymentReal) {
            paymentReal.paymentChannelId = info.paymentChannelId || paymentReal.paymentChannelId;
            paymentReal.paymentChannelOperationId =
                info.paymentChannelOperationId || paymentReal.paymentChannelOperationId;
            if (info.paymentStatus == "COMPLETED") {
                paymentReal.status = "COMPLETED";
                // TODO: trigger transaction generation
            } else if (info.paymentStatus == "EXPIRED") {
                paymentReal.status = "EXPIRED";
            } else {
                paymentReal.status = "WAITING";
            }
            //
            await this.paymentrepo.save(paymentReal);
        } else {
            throw new NotFoundException("payment", id);
        }
    }

    // async generateTransactions(id: string, captureInfo: PaymentCaptureInfoDTO) {
    //     const paymentReal = await this.findPaymentByIdRaw(id);
    //     if (paymentReal) {
    //         const items = await this.findItems(id);
    //         for (let index = 0; index < items.length; index++) {
    //             const paymentItem = items[index];
    //             // const itemId = item.itemId;
    //             // const itemReal = await this.itemService.fetchOne(itemId);

    //             const transaction = new PaymentTransactionDTO();
    //             transaction.amount = captureInfo.paidAmount;
    //             transaction.currency = paymentReal.currency;
    //             transaction.paymentChannelId = captureInfo.paymentChannelId;
    //             transaction.paymentId = paymentReal.id;
    //             transaction.sourceAccountId = paymentReal.customerAccountId;
    //             transaction.targetAccountId = paymentItem.sellerAccountId;
    //             transaction.status = 'INITIATED';
    //             transaction.approved = false;
    //         }

    //     } else {
    //         throw new NotFoundException("payment", id);
    //     }
    // }

    async init(pdto: PaymentInitDTO): Promise<PaymentDTO> {
        let taxesFromItems: TaxDTO[] = [],
            items: PostralPaymentItem[] = [];
        // transactions: {[sourceAccountId: string]: PaymentTransactionDTO} = {};
        let totalAmt = 0,
            taxTotal = 0;



        for (let itemIndex = 0; itemIndex < pdto.items.length; itemIndex++) {
            const paymentItemDto = pdto.items[itemIndex];

            const realItemFind = (
                await this.itemService.fetchAll(
                    paymentItemDto.itemId
                        ? { id: paymentItemDto.itemId }
                        : {
                            entityGroup: paymentItemDto.entityGroup,
                            entityId: paymentItemDto.entityId,
                            entityName: paymentItemDto.entityName,
                        },
                )
            )[0];

            const itemPriceActive = await this.itemPriceService.allLatestPrices(
                {
                    currency: pdto.currency,
                    itemId: realItemFind.id,
                    // region:
                    variation: paymentItemDto.variation,
                },
            );
            const itemPriceDefault =
                await this.itemPriceService.allDefaultPrices({
                    currency: pdto.currency,
                    itemId: realItemFind.id,
                    // region:
                    variation: paymentItemDto.variation,
                });

            const paymentItem = new PostralPaymentItem();
            paymentItem.variation = itemPriceActive[0].variation;
            paymentItem.entityGroup = realItemFind.entityGroup;
            paymentItem.entityId = realItemFind.entityId;
            paymentItem.entityName = realItemFind.entityName;
            paymentItem.totalAmount =
                itemPriceActive[0].itemPrice * paymentItemDto.quantity;
            paymentItem.taxPercent = itemPriceActive[0].taxPercent;
            paymentItem.variation = paymentItem.entityOwnerAccountId =
                realItemFind.sellerAccountId;
            paymentItem.originalUnitAmount = itemPriceDefault[0].itemPrice || 0;
            paymentItem.unitAmount = itemPriceActive[0].itemPrice;
            paymentItem.itemId = realItemFind.id;
            paymentItem.sellerAccountId = realItemFind.sellerAccountId;

            totalAmt += paymentItem.totalAmount;
            const taxDto = TaxCalculationUtil.generateTaxDto(
                itemPriceActive[0].taxPercent.toString(),
                paymentItem.totalAmount,
                itemPriceActive[0].taxPercent,
            );
            taxTotal += taxDto.taxAmount;

            taxesFromItems.push(taxDto);

            paymentItem.name = realItemFind.name;
            paymentItem.taxAmount = taxDto.taxAmount!;
            paymentItem.unTaxAmount = taxDto.untaxAmount!;
            paymentItem.quantity = paymentItemDto.quantity;
            items.push(paymentItem);

            // transactions[paymentItem.entityOwnerAccountId] = {
            //     amount: paymentItem.unTaxAmount,
            //     taxAmount: paymentItem.taxAmount,
            //     currency: pdto.currency,
            //     paymentChannelId: pdto.paymentChannelId,
            //     paymentId: '', // to be filled after payment is created
            //     sourceAccountId: pdto.customerAccountId,
            //     targetAccountId: paymentItem.entityOwnerAccountId,
            //     status: 'INITIATED',
            //     approved: false,
            // };
        }

        const p = new Payment();
        p.type = pdto.type;
        p.currency = pdto.currency;
        p.totalAmount = totalAmt;
        p.taxAmount = taxTotal;
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
            await this.eventSenderService.onPaymentInitialized(paymentDtoFinal);
        } catch (error) {
            console.error(error);
        }
        return paymentDtoFinal;
    }


    async startPaymentOperation(id: string, captureInfo: PaymentCaptureInfoDTO) {

        const paymentDto = await this.findPaymentById(id);
        const paymentItems = await this.findItems(id);
        const paymentTaxes = await this.findTaxes(id);

        if (captureInfo.paidAmount !== undefined && captureInfo.paidAmount <= 0) {
            captureInfo.paidAmount = paymentDto.totalAmount;
        }

        try {
            const result = await this.eventSenderService.paymentChannelStarted({
                ...paymentDto,
                items: paymentItems,
                taxes: paymentTaxes,
                captureInfo: captureInfo,
            });
            await this.editPaymentOperationInformation(id, result);
            return result;


        } catch (error) {
            console.error(error);
            throw error;
        }
    }

    async checkPaymentStatus(id: string, captureInfo: PaymentCaptureInfoDTO) {
        // return this.transactionService.checkTransactionsStatus(id, captureInfo);
    }
}
