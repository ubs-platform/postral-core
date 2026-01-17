import { Inject, Injectable, NotFoundException, Post } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Payment } from '../entity/payment.entity';
import { Repository, Transaction } from 'typeorm';
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
    PaymentTransactionDTO,
} from '@tk-postral/payment-common';
import { ItemService } from './item.service';
import { PaymentTaxMapper } from '../mapper/payment-tax.mapper';
import { ItemPriceService } from './item-price.service';
import { PaymentCaptureInfoDTO } from '@tk-postral/payment-common/dto/capture-info.dto';
import { PaymentTransactionService } from './transaction.service';
import { PaymentChannelStatusDTO } from '@tk-postral/payment-common/dto/payment-channel-status';
import { ItemCalculationUtil } from '../util/calcs/item-calculations';
import { ItemTaxService } from './item-tax.service';
import { AccountService } from './account.service';

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
        private itemTaxService: ItemTaxService,
        private accountService: AccountService
    ) { }

    async findAllRaw(): Promise<Payment[]> {
        return this.paymentrepo.find();
    }
    async findAll(): Promise<PaymentDTO[]> {
        return (await this.findAllRaw()).map((p) =>
            this.paymentMapper.toDto(p),
        );
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
        return (
            await this.paymentrepo.find({
                where: { id },
            })
        )[0];
    }

    async editPaymentOperationInformation(
        id: string,
        info: PaymentChannelStatusDTO,
    ) {
        const paymentReal = await this.findPaymentByIdRaw(id);
        if (paymentReal) {
            if (
                paymentReal.paymentStatus === 'FAILED' ||
                paymentReal.paymentStatus === 'COMPLETED'
            ) {
                // already finalized
                return;
            }

            paymentReal.paymentChannelId =
                info.paymentChannelId || paymentReal.paymentChannelId;
            paymentReal.paymentChannelOperationId =
                info.paymentChannelOperationId ||
                paymentReal.paymentChannelOperationId;

            paymentReal.paymentStatus = info.paymentStatus;
            paymentReal.errorStatus = info.paymentErrorStatus;
            await this.paymentrepo.save(paymentReal);

            if (paymentReal.paymentStatus === 'COMPLETED') {
                await this.generateTransactions(paymentReal, info);
            }
        } else {
            throw new NotFoundException('payment', id);
        }
    }

    async generateTransactions(
        paymentReal: Payment,
        captureInfo: PaymentChannelStatusDTO,
    ) {
        const items = await this.findItems(paymentReal.id);
        for (let index = 0; index < items.length; index++) {
            const paymentItem = items[index];
            const transaction = new PaymentTransactionDTO();
            transaction.amount = paymentItem.totalAmount;
            transaction.taxAmount = paymentItem.taxAmount;
            transaction.currency = paymentReal.currency;
            transaction.paymentChannelId = captureInfo.paymentChannelId!;
            transaction.paymentId = paymentReal.id;
            transaction.sourceAccountId = paymentReal.customerAccountId;
            transaction.targetAccountId = paymentItem.sellerAccountId;
            transaction.paymentStatus = paymentReal.paymentStatus;
            transaction.transactionType = 'CREDIT';
            await this.transactionService.addTransaction(transaction);
        }
    }

    async init(pdto: PaymentInitDTO): Promise<PaymentDTO> {
        const customerAccountId = pdto.customerAccountId; // TOOD: Auth'd user id gelmeli...
        const customerAccount = await this.accountService.fetchOne(customerAccountId);

        if (!customerAccount) {
            throw new NotFoundException('Customer account not found for payment init');
        }

        if (pdto.saleMode === undefined || pdto.saleMode.trim() === '') {
            pdto.saleMode = 'DEFAULT';
        }

        let taxesFromItems: TaxDTO[] = [],
            items: PostralPaymentItem[] = [];
        // transactions: {[sourceAccountId: string]: PaymentTransactionDTO} = {};
        let totalAmt = 0,
            taxTotal = 0;


        for (let itemIndex = 0; itemIndex < pdto.items.length; itemIndex++) {

            const paymentItemDto = pdto.items[itemIndex];
            
            if (!paymentItemDto.itemId && (!paymentItemDto.entityGroup || !paymentItemDto.entityId || !paymentItemDto.entityName)) {
                throw new NotFoundException('Item identification is missing for payment init');
            }
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

            if (!realItemFind) {
                throw new NotFoundException('Item not found for payment init');
            }

            const itemAccount = await this.accountService.fetchOne(realItemFind.sellerAccountId);
            if (!itemAccount) {
                throw new NotFoundException('Seller account not found for payment init');
            }
            if (itemAccount.type !== "COMMERCIAL") {
                throw new NotFoundException(`Item that is named "${realItemFind.name}" seller account is not commercial for payment init.`);
            }

            const itemTax = await this.itemTaxService.fetchOne(
                realItemFind.itemTaxId!,
            );
            if (!itemTax) {
                throw new NotFoundException(
                    'Item tax not found for payment init',
                );
            }

            const taxPercentBySaleMode = itemTax.variations.find(
                (v) => v.taxMode === pdto.saleMode,
            )?.taxRate;

            if (taxPercentBySaleMode === undefined) {
                throw new NotFoundException(
                    `Item tax variation not found for sale mode: ${pdto.saleMode}`,
                );
            }

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
                ItemCalculationUtil.calculateTotalItemPrice(
                    itemPriceActive[0].itemPrice,
                    paymentItemDto.quantity,
                );
            paymentItem.taxPercent = taxPercentBySaleMode;
            paymentItem.variation = paymentItem.entityOwnerAccountId =
                realItemFind.sellerAccountId;
            paymentItem.originalUnitAmount = itemPriceDefault[0].itemPrice || 0;
            paymentItem.unitAmount = itemPriceActive[0].itemPrice;
            paymentItem.itemId = realItemFind.id;
            paymentItem.sellerAccountId = realItemFind.sellerAccountId;

            totalAmt = ItemCalculationUtil.addNumberValues(
                totalAmt,
                paymentItem.totalAmount,
            );

            const taxDto = TaxCalculationUtil.generateTaxDto(
                itemTax.taxName + ' - ' + pdto.saleMode,
                paymentItem.totalAmount,
                taxPercentBySaleMode,
            );
            taxTotal = ItemCalculationUtil.addNumberValues(
                taxTotal,
                taxDto.taxAmount,
            );

            taxesFromItems.push(taxDto);

            paymentItem.name = realItemFind.name;
            paymentItem.taxAmount = taxDto.taxAmount!;
            paymentItem.unTaxAmount = taxDto.untaxAmount!;
            paymentItem.quantity = paymentItemDto.quantity;
            items.push(paymentItem);
        }

        const p = new Payment();
        p.type = pdto.type;
        p.currency = pdto.currency;
        p.totalAmount = totalAmt;
        p.taxAmount = taxTotal;
        p.items = items;
        p.customerAccountId = customerAccountId;
        p.paymentStatus = 'INITIATED';
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

    async startPaymentOperation(
        id: string,
        captureInfo: PaymentCaptureInfoDTO,
    ) {
        const paymentDto = await this.findPaymentById(id);
        const paymentItems = await this.findItems(id);
        const paymentTaxes = await this.findTaxes(id);

        if (
            captureInfo.paidAmount !== undefined &&
            captureInfo.paidAmount <= 0
        ) {
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

    async checkPaymentStatus(id: string) {
        const paymentDto = await this.findPaymentById(id);
        const result =
            await this.eventSenderService.paymentChannelStatusChecked(
                paymentDto.paymentChannelId!,
                id,
            );
        await this.editPaymentOperationInformation(id, result);

        return result;
        // return this.transactionService.checkTransactionsStatus(id, captureInfo);
    }
}
