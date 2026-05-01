import { Injectable, NotFoundException } from '@nestjs/common';
import { ItemService } from './item.service';
import {
    PaymentItemDto,
    PaymentItemInputDto,
} from '@tk-postral/payment-common';
import {
    ItemListCalculationInputDto,
    ItemListCalculationDto,
} from '@tk-postral/payment-common/dto/calculation.dto';
import { PostralPaymentItem } from '../entity';
import { AmountCalculationUtil } from '../util/calcs/amount-calculations';
import { TaxCalculationUtil } from '../util/calcs/tax-calculations';
import { ItemTaxService } from './item-tax.service';
import { AccountService } from './account.service';
import { ItemPriceService } from './item-price.service';
import { TaxDTO } from '@tk-postral/payment-common';
import { AppComissionService } from './app-commission.service';
import { AdminSettingsService } from './admin-settings.service';

@Injectable()
export class OrderCalculationService {

    constructor(
        private itemService: ItemService,
        private accountService: AccountService,
        private itemTaxService: ItemTaxService,
        private itemPriceService: ItemPriceService,
        private comissionService: AppComissionService,
        private adminSettingsService: AdminSettingsService
    ) { }


    async calculateTotalAmount(
        paymentItems: ItemListCalculationInputDto,
    ): Promise<ItemListCalculationDto> {
        let totalAmt = 0,
            taxTotal = 0;
        const items: PaymentItemDto[] = [];
        const taxesFromItems: TaxDTO[] = [];
        for (
            let itemIndex = 0;
            itemIndex < paymentItems.items.length;
            itemIndex++
        ) {
            const paymentItemDto = paymentItems.items[itemIndex];
            if (
                !paymentItemDto.itemId &&
                (!paymentItemDto.entityGroup ||
                    !paymentItemDto.entityId ||
                    !paymentItemDto.entityName)
            ) {
                throw new NotFoundException(
                    'Item identification is missing for payment init',
                );
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

            const comission = await this.comissionService.fetchOneForCalculation(realItemFind.sellerAccountId, realItemFind.itemClass || "");

            const itemAccount = await this.accountService.fetchOne(
                realItemFind.sellerAccountId,
            );
            if (!itemAccount) {
                throw new NotFoundException(
                    'Seller account not found for payment init',
                );
            }
            if (itemAccount.type !== 'COMMERCIAL') {
                throw new NotFoundException(
                    `Item that is named "${realItemFind.name}" seller account is not commercial for payment init.`,
                );
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
                (v) => v.taxMode === paymentItems.saleMode,
            )?.taxRate;

            if (taxPercentBySaleMode === undefined) {
                throw new NotFoundException(
                    `Item tax variation not found for sale mode: ${paymentItems.saleMode}`,
                );
            }

            const itemPriceActive = await this.itemPriceService.allLatestPrices(
                {
                    currency: paymentItems.currency,
                    itemId: realItemFind.id,
                    // region:
                    variation: paymentItemDto.variation,
                },
            );
            const itemPriceDefault =
                await this.itemPriceService.allDefaultPrices({
                    currency: paymentItems.currency,
                    itemId: realItemFind.id,
                    // region:
                    variation: paymentItemDto.variation,
                });

            const paymentItem = new PostralPaymentItem();
            paymentItem.variation = itemPriceActive[0].variation;
            paymentItem.entityGroup = realItemFind.entityGroup;
            paymentItem.entityId = realItemFind.entityId;
            paymentItem.entityName = realItemFind.entityName;
            paymentItem.itemClass = realItemFind.itemClass || "";
            paymentItem.totalAmount =
                AmountCalculationUtil.multiplyNumberValues(
                    itemPriceActive[0].itemPrice,
                    paymentItemDto.quantity,
                );

            const admSettings = await this.adminSettingsService.getAdminSettings();


            paymentItem.taxPercent = taxPercentBySaleMode;
            paymentItem.itemId = realItemFind.id;
            paymentItem.sellerAccountId = realItemFind.sellerAccountId;
            paymentItem.originalUnitAmount = itemPriceDefault[0].itemPrice || 0;
            paymentItem.unitAmount = itemPriceActive[0].itemPrice;
            paymentItem.unit = realItemFind.unit;
            totalAmt = AmountCalculationUtil.addNumberValues(
                totalAmt,
                paymentItem.totalAmount,
            );

            const taxDto = TaxCalculationUtil.generateTaxDto(
                itemTax.taxName + ' - ' + paymentItems.saleMode,
                paymentItem.totalAmount,
                taxPercentBySaleMode,
            );
            taxTotal = AmountCalculationUtil.addNumberValues(
                taxTotal,
                taxDto.taxAmount,
            );

            taxesFromItems.push(taxDto);
            paymentItem.name = realItemFind.name;
            paymentItem.taxAmount = taxDto.taxAmount!;
            paymentItem.unTaxAmount = taxDto.untaxAmount!;
            paymentItem.quantity = paymentItemDto.quantity;
            paymentItem.appComissionPercent = comission.percent;
            paymentItem.appComissionAmount = AmountCalculationUtil.calculateComissionAmountByPercent(
                admSettings.comissionsCalculatedFromNet ? paymentItem.unTaxAmount : paymentItem.totalAmount,
                comission.percent,
            );
            items.push(paymentItem);
        }
        return new ItemListCalculationDto(
            items,
            totalAmt,
            taxTotal,
            taxesFromItems
        );
    }
}
