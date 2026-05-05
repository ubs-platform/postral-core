import { BadRequestException } from '@nestjs/common';
import { TaxDTO } from '@tk-postral/payment-common';
import { ArrayToObjectUtil } from './array-to-object';
import { TypeAssertionUtil } from './type-assertion';
import { AmountCalculationUtil } from './amount-calculations';

export class TaxCalculationUtil {
    static calculateUntaxedPrice(fullAmount: number, taxAmount: number) {
        TypeAssertionUtil.assertIsNumber(
            fullAmount,
            'Full amount must be a number',
        );
        TypeAssertionUtil.assertIsNumber(
            taxAmount,
            'Tax amount must be a number',
        );
        return AmountCalculationUtil.minusNumberValues(fullAmount, taxAmount);
    }

    static calculatePercent(fullAmount: number, taxAmount: number) {
        TypeAssertionUtil.assertIsNumber(
            fullAmount,
            'Full amount must be a number',
        );
        TypeAssertionUtil.assertIsNumber(
            taxAmount,
            'Tax amount must be a number',
        );

        const untaxAmount = this.calculateUntaxedPrice(fullAmount, taxAmount);
        return AmountCalculationUtil.multiplyNumberValues(
            AmountCalculationUtil.divideNumberValues(taxAmount, untaxAmount),
            100,
        );
    }

    static calculateTaxAmount(fullAmount: number, percent: number) {
        TypeAssertionUtil.assertIsNumber(
            fullAmount,
            'Full amount must be a number',
        );
        TypeAssertionUtil.assertIsNumber(percent, 'Percent must be a number');
        const fullPercent = AmountCalculationUtil.addNumberValues(percent, 100);
        return AmountCalculationUtil.divideNumberValues(
            AmountCalculationUtil.multiplyNumberValues(percent, fullAmount),
            fullPercent,
        );
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
            fullTotal = AmountCalculationUtil.addNumberValues(
                fullTotal,
                tax.fullAmount,
            );

            taxTotal = AmountCalculationUtil.addNumberValues(
                taxTotal,
                tax.taxAmount,
            );
        }
        return this.generateTaxDto('Total', fullTotal, null, taxTotal);
    }

    static mergeTaxesByPercent(taxes: TaxDTO[]) {
        return Object.values(
            ArrayToObjectUtil.arrayConditionCirculation(
                taxes,
                (a: TaxDTO) => a.percent.toString(),
                (
                    object: TaxDTO,
                    key: string,
                    map: { [key: string]: TaxDTO },
                ) => {
                    if (map[key]) {
                        map[key] = this.mergeTaxes([map[key], object]);
                    } else {
                        map[key] = object;
                    }
                },
            ),
        ) as TaxDTO[];

        // return this.generateTaxDto('Total', fullTotal, null, taxTotal);
    }
}
