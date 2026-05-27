import { TypeAssertionUtil } from "./type-assertion";
import * as BigJs from "big.js";
// Nambır nambır altmış yedii
export type NumberLike = number | BigJs.Big;
export class AmountCalculationUtil {

    static addNumberValues(...values: Array<NumberLike>): BigJs.Big {
        let total = new BigJs(0);
        for (let i = 0; i < values.length; i++) {
            let value = values[i];
            value = Number(value);
            TypeAssertionUtil.assertIsNumber(
                value,
                `Value at index ${i} must be a number`,
            );
            total = total.plus(value);
        }
        return total;
    }

    static minusNumberValues(initialValue: NumberLike, ...values: Array<NumberLike>): BigJs.Big {
        TypeAssertionUtil.assertIsNumber(
            Number(initialValue),
            'Initial value must be a number',
        );
        let val = new BigJs(initialValue);
        for (let i = 0; i < values.length; i++) {
            let value = values[i];
            value = Number(value);
            TypeAssertionUtil.assertIsNumber(
                value,
                `Value at index ${i} must be a number`,
            );
            val = val.minus(value);
        }
        return val;

    }

    static multiplyNumberValues(...values: Array<NumberLike>): BigJs.Big {
        let startValue = new BigJs(1);
        for (let i = 0; i < values.length; i++) {
            let multiplierItem = values[i];
            multiplierItem = Number(multiplierItem);
            TypeAssertionUtil.assertIsNumber(
                multiplierItem,
                `Value at index ${i} must be a number`,
            );
            startValue = startValue.times(multiplierItem);
        }
        return startValue;
    }

    


    static divideNumberValues(initialValue: NumberLike, ...values: Array<NumberLike>): BigJs.Big {
        if (new BigJs(initialValue).eq(0)) {
            return new BigJs(0); // If the initial value is zero, return zero to avoid division by zero
        }

        TypeAssertionUtil.assertIsNumber(
            Number(initialValue),
            'Initial value must be a number',
        );

        const divisor = this.multiplyNumberValues(...values);
        if (divisor.eq(0)) {
            throw new Error('Division by zero is not allowed');
        }
        return new BigJs(initialValue).div(divisor);

    }

    static calculateComissionAmountByPercent(amount: NumberLike, percent: NumberLike): BigJs.Big {
        TypeAssertionUtil.assertIsNumber(
            Number(amount),
            'Amount must be a number',
        );
        TypeAssertionUtil.assertIsNumber(
            Number(percent),
            'Percent must be a number',
        );
        return this.divideNumberValues(this.multiplyNumberValues(amount, percent), 100);
    }

    static toFixedNumber(value: NumberLike, decimalPlaces: number = 2): number {
        TypeAssertionUtil.assertIsNumber(
            Number(value),
            'Value must be a number',
        );
        const bigValue = new BigJs(value);
        return parseFloat(bigValue.toFixed(decimalPlaces));
    }

}