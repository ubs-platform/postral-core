import {
    BadRequestException,
    Injectable,
    NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import {
    AmountCalculationUtil,
    TaxCalculationUtil,
} from '@tk-postral/common-utils';
import {
    CreateExternalPlatformPaymentDTO,
    PaymentDTO,
    TaxDTO,
} from '@tk-postral/payment-common';
import { Payment, PostralPaymentItem } from '@tk-postral/postral-entities';
import { UserAuthBackendDTO } from '@ubs-platform/users-common';
import { Repository } from 'typeorm';
import { PaymentMapper } from '../mapper/payment.mapper';
import { PaymentTaxMapper } from '../mapper/payment-tax.mapper';
import { AccountService } from './account.service';
import { AddressService } from './address.service';
import { AdminSettingsService } from './admin-settings.service';
import { AppComissionService } from './app-commission.service';
import { ExternalPlatformService } from './external-platform.service';
import { PaymentService } from './payment.service';

@Injectable()
export class ExternalPlatformPaymentService {
    constructor(
        @InjectRepository(Payment)
        private readonly paymentRepo: Repository<Payment>,
        private readonly paymentMapper: PaymentMapper,
        private readonly paymentTaxMapper: PaymentTaxMapper,
        private readonly accountService: AccountService,
        private readonly addressService: AddressService,
        private readonly adminSettingsService: AdminSettingsService,
        private readonly appComissionService: AppComissionService,
        private readonly externalPlatformService: ExternalPlatformService,
        private readonly paymentService: PaymentService,
    ) {}

    public async createExternalPlatformPayment(
        dto: CreateExternalPlatformPaymentDTO,
        user?: UserAuthBackendDTO,
    ): Promise<PaymentDTO> {
        if (!dto.items || dto.items.length === 0) {
            throw new BadRequestException(
                'External platform payment must contain at least one item',
            );
        }

        const externalPlatform = await this.externalPlatformService.fetchOne(
            dto.externalPlatformId,
        );
        if (!externalPlatform) {
            throw new NotFoundException('External platform not found');
        }

        const customerAccount =
            await this.accountService.resolveOrCreateForExternalPlatform(
                dto.customerAccount,
                dto.externalPlatformId,
                user,
            );
        const billingAddress =
            await this.addressService.resolveOrCreateForExternalPlatform(
                dto.billingAddress,
                dto.externalPlatformId,
                user,
            );
        if (customerAccount.defaultAddressId !== billingAddress.id) {
            await this.accountService.updateDefaultAddress(
                customerAccount.id,
                billingAddress.id,
            );
        }

        const adminSettings =
            await this.adminSettingsService.getAdminSettings();
        const items: PostralPaymentItem[] = [];
        const taxesFromItems: TaxDTO[] = [];
        let totalAmount = 0;
        let taxTotal = 0;

        for (const inputItem of dto.items) {
            const itemClass = inputItem.itemClass || '';
            const commission =
                await this.appComissionService.fetchOneForCalculation(
                    inputItem.sellerAccountId,
                    itemClass,
                    dto.externalPlatformId,
                );

            const item = new PostralPaymentItem();
            item.itemId = inputItem.itemId || '';
            item.name = inputItem.name;
            item.quantity = inputItem.quantity;
            item.unitAmount = inputItem.unitAmount;
            item.originalUnitAmount = inputItem.unitAmount;
            item.totalAmount = AmountCalculationUtil.multiplyNumberValues(
                inputItem.unitAmount,
                inputItem.quantity,
            );
            item.taxPercent = inputItem.taxRate;

            const taxDto = TaxCalculationUtil.generateTaxDto(
                `${externalPlatform.name} - ${inputItem.taxRate}`,
                item.totalAmount,
                inputItem.taxRate,
            );
            item.taxAmount = taxDto.taxAmount!;
            item.unTaxAmount = taxDto.untaxAmount!;
            item.sellerAccountId = inputItem.sellerAccountId;
            item.variation = inputItem.variation || '';
            item.itemClass = itemClass;
            item.entityGroup = '';
            item.entityName = '';
            item.entityId = '';
            item.unit = inputItem.unit || 'ITEM';
            item.appComissionPercent = commission.percent;
            item.appComissionAmount =
                AmountCalculationUtil.calculateComissionAmountByPercent(
                    adminSettings.comissionsCalculatedFromNet
                        ? item.unTaxAmount
                        : item.totalAmount,
                    commission.percent,
                );

            totalAmount = AmountCalculationUtil.addNumberValues(
                totalAmount,
                item.totalAmount,
            );
            taxTotal = AmountCalculationUtil.addNumberValues(
                taxTotal,
                item.taxAmount,
            );
            taxesFromItems.push(taxDto);
            items.push(item);
        }

        const payment = new Payment();
        payment.type = 'PURCHASE';
        payment.currency = dto.currency;
        payment.totalAmount = totalAmount;
        payment.taxAmount = taxTotal;
        payment.items = items;
        payment.customerAccountId = customerAccount.id;
        payment.billingAddressId = billingAddress.id;
        payment.externalPlatformId = dto.externalPlatformId;
        payment.externalPlatformOrderId = dto.externalPlatformOrderId;
        payment.paymentStatus = 'COMPLETED';
        payment.openPayment = false;
        payment.includeInReportDigestion = true;
        payment.taxes = TaxCalculationUtil.mergeTaxesByPercent(
            taxesFromItems,
        ).map((tax) => this.paymentTaxMapper.toEntity(tax));

        await this.paymentService.applyItemSellerSnapshots(payment.items);
        await this.paymentService.applyAccountSnapshot(
            customerAccount,
            payment,
        );
        await this.paymentService.applyAddressSnapshot(payment);

        const saved = await this.paymentRepo.save(payment);
        await this.paymentService.onPaymentCompleted(saved);

        const paymentDto = this.paymentMapper.toDto(saved);
        this.paymentService.paymentStream.next(paymentDto);
        return paymentDto;
    }
}
