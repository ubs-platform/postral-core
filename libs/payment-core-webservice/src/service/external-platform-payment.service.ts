import {
    BadRequestException,
    Injectable,
    NotFoundException,
    ConflictException,
    UnauthorizedException,
    Logger,
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
import { ExternalPlatform, Payment, PostralPaymentItem } from '@tk-postral/postral-entities';
import { UserAuthBackendDTO } from '@ubs-platform/users-common';
import { EntityManager, Repository } from 'typeorm';
import { PaymentMapper } from '../mapper/payment.mapper';
import { PaymentTaxMapper } from '../mapper/payment-tax.mapper';
import { AccountService } from './account.service';
import { AddressService } from './address.service';
import { AdminSettingsService } from './admin-settings.service';
import { AppComissionService } from './app-commission.service';
import { ExternalPlatformService } from './external-platform.service';
import { PaymentService } from './payment.service';
import { AuthUtilService } from './auth-util.service';
import { PostralConstants } from '../util/consts';
import { InvoiceAddressMapper } from '../mapper/invoice-address.mapper';

@Injectable()
export class ExternalPlatformPaymentService {
    private readonly logger = new Logger(ExternalPlatformPaymentService.name);

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
        private readonly authUtilService: AuthUtilService,
        private readonly invoiceAddressMapper: InvoiceAddressMapper,
    ) {}

    public async createExternalPlatformPayment(
        dto: CreateExternalPlatformPaymentDTO,
        user: UserAuthBackendDTO,
    ): Promise<PaymentDTO> {
        if (!user?.id) {
            throw new UnauthorizedException('Authentication is required');
        }
        this.validateInput(dto);
        for (const sellerId of new Set(dto.items.map(item => item.sellerAccountId))) {
            if (!user.roles?.includes('ADMIN')) {
                await this.authUtilService.checkUserEntityOwnership(
                    'EDIT', user, {}, { id: sellerId },
                    PostralConstants.ENTITY_NAME_ACCOUNT, 'seller account',
                );
            }
            const seller = await this.accountService.fetchOne(sellerId);
            if (!seller || seller.deactivated || seller.isExternal || seller.type !== 'COMMERCIAL') {
                throw new BadRequestException('An active commercial seller account is required');
            }
            if (!seller.defaultAddressId) {
                throw new BadRequestException('The seller account must have a default address');
            }
        }

        // Serialize external order creation across app instances without changing normal payments.
        const saved = await this.paymentRepo.manager.transaction(async manager => {
            const platform = await manager.findOne(ExternalPlatform, {
                where: { id: dto.externalPlatformId },
                lock: { mode: 'pessimistic_write' },
            });
            if (!platform) {
                throw new NotFoundException('External platform not found');
            }
            if (!platform.active) {
                throw new BadRequestException('External platform is inactive');
            }
            const existing = await manager.findOne(Payment, {
                where: {
                    externalPlatformId: dto.externalPlatformId,
                    externalPlatformOrderId: dto.externalPlatformOrderId.trim(),
                    type: 'PURCHASE',
                },
            });
            if (existing) {
                throw new ConflictException('This external platform order has already been recorded');
            }
            return this.createPayment(dto, manager);
        });

        try {
            await this.paymentService.onPaymentCompleted(saved);
        } catch (error) {
            this.logger.error(
                `External payment ${saved.id} was saved, but completion processing failed; do not recreate the order`,
                error instanceof Error ? error.stack : String(error),
            );
            throw new ConflictException(
                `Payment ${saved.id} was recorded, but completion processing failed. Contact an administrator; do not recreate this order.`,
            );
        }
        const paymentDto = this.paymentMapper.toDto(saved);
        this.paymentService.paymentStream.next(paymentDto);
        return paymentDto;
    }

    private async createPayment(
        dto: CreateExternalPlatformPaymentDTO,
        manager: EntityManager,
    ): Promise<Payment> {
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
                undefined,
                manager,
            );
        const billingAddress =
            await this.addressService.resolveOrCreateForExternalPlatform(
                dto.billingAddress,
                dto.externalPlatformId,
                undefined,
                manager,
            );
        if (customerAccount.defaultAddressId !== billingAddress.id) {
            await this.accountService.updateDefaultAddress(
                customerAccount.id,
                billingAddress.id,
                manager,
            );
            customerAccount.defaultAddressId = billingAddress.id;
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
        payment.externalPlatformOrderId = dto.externalPlatformOrderId.trim();
        payment.paymentStatus = 'COMPLETED';
        payment.openPayment = false;
        payment.includeInReportDigestion = true;
        payment.taxes = TaxCalculationUtil.mergeTaxesByPercent(
            taxesFromItems,
        ).map((tax) => this.paymentTaxMapper.toEntity(tax));

        await this.paymentService.applyItemSellerSnapshots(payment.items);
        await this.paymentService.applyAccountSnapshot(
            await this.accountService.toOutput(customerAccount),
            payment,
        );
        payment.customerSnapshotAddress = this.invoiceAddressMapper.toEntityFromAccountAddress(billingAddress);

        return manager.save(Payment, payment);
    }

    private validateInput(dto: CreateExternalPlatformPaymentDTO): void {
        const requiredText = (value: unknown, field: string): void => {
            if (typeof value !== 'string' || !value.trim() || value.length > 255) {
                throw new BadRequestException(`${field} is required and must not exceed 255 characters`);
            }
        };
        if (!dto || !Array.isArray(dto.items) || dto.items.length === 0) {
            throw new BadRequestException('External platform payment must contain at least one item');
        }
        requiredText(dto.externalPlatformId, 'externalPlatformId');
        requiredText(dto.externalPlatformOrderId, 'externalPlatformOrderId');
        if (typeof dto.currency !== 'string' || !/^[A-Z]{3}$/.test(dto.currency)) {
            throw new BadRequestException('currency must be a three-letter uppercase code');
        }
        if (!dto.customerAccount || !dto.billingAddress) {
            throw new BadRequestException('Customer and billing address are required');
        }
        for (const input of [dto.customerAccount, dto.billingAddress]) {
            if (input.id || input.entityOwnershipGroupId ||
                (input.externalPlatformId && input.externalPlatformId !== dto.externalPlatformId)) {
                throw new BadRequestException('Existing IDs and ownership fields are not allowed in external customer inputs');
            }
        }
        const customer = dto.customerAccount;
        if (customer.ownerUserId || customer.defaultAddressId || customer.bankAccounts?.length ||
            customer.bankIban || customer.bankName || customer.bankBic || customer.bankSwift ||
            customer.deactivated || customer.isExternal === false) {
            throw new BadRequestException('External customer account management fields are not allowed');
        }
        requiredText(customer.name, 'customerAccount.name');
        requiredText(customer.legalIdentity, 'customerAccount.legalIdentity');
        if (customer.type !== 'INDIVIDUAL' && customer.type !== 'COMMERCIAL') {
            throw new BadRequestException('Invalid customer account type');
        }
        for (const field of ['name', 'streetName', 'cityName', 'citySubdivisionName', 'postalZone', 'country'] as const) {
            requiredText(dto.billingAddress[field], `billingAddress.${field}`);
        }
        for (const item of dto.items) {
            if (!item) {
                throw new BadRequestException('Invalid payment item');
            }
            requiredText(item.name, 'items.name');
            requiredText(item.sellerAccountId, 'items.sellerAccountId');
            if (!Number.isFinite(item.quantity) || item.quantity <= 0 ||
                !Number.isFinite(item.unitAmount) || item.unitAmount <= 0 ||
                !Number.isFinite(item.quantity * item.unitAmount) ||
                !Number.isFinite(item.taxRate) || item.taxRate < 0 || item.taxRate > 100) {
                throw new BadRequestException('Items require positive quantity and price, and a tax rate between 0 and 100');
            }
        }
    }
}
