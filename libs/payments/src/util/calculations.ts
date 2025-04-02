import { BadRequestException } from '@nestjs/common';
import { TaxDTO } from '../dto/tax.dto';

export class TaxCalculationUtil {
    static calculateUntaxedPrice(fullAmount: number, taxAmount: number) {
        return fullAmount - taxAmount;
    }

    static calculatePercent(fullAmount: number, taxAmount: number) {
        const untaxAmount = this.calculateUntaxedPrice(fullAmount, taxAmount);
        return (100 * taxAmount) / untaxAmount;
    }

    static calculateTaxAmount(fullAmount: number, percent: number) {
        const fullPercent = percent + 100;
        return (percent * fullAmount) / fullPercent;
    }

    static generateTaxDto(
        taxName: string,
        fullAmount: number,
        percent?: number | null,
        taxAmount?: number | null,
    ) {
        let untaxAmount = 0;
        if (percent == null && taxAmount == null) {
            throw new BadRequestException(
                'There is no enough information. Please provide fullAmount and (taxAmount or percent)',
                'TAX',
            );
        } else if (percent != null) {
            taxAmount = TaxCalculationUtil.calculateTaxAmount(
                fullAmount,
                percent,
            );
            untaxAmount = TaxCalculationUtil.calculateUntaxedPrice(
                fullAmount,
                taxAmount,
            );
        } else if (taxAmount != null) {
            untaxAmount = TaxCalculationUtil.calculateUntaxedPrice(
                fullAmount,
                taxAmount,
            );
            percent = TaxCalculationUtil.calculatePercent(
                fullAmount,
                taxAmount,
            );
        }

        return new TaxDTO(
            taxName,
            fullAmount,
            percent!,
            taxAmount!,
            untaxAmount,
        );
    }

    static mergeTaxes(taxes: TaxDTO[]) {
        let fullTotal = 0,
            taxTotal = 0;
        for (let index = 0; index < taxes.length; index++) {
            const tax = taxes[index];
            fullTotal += tax.fullAmount;
            taxTotal += tax.taxAmount;
        }
        return this.generateTaxDto('Total', fullTotal, null, taxTotal);
    }
}
