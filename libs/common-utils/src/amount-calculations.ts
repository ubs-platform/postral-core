import { TypeAssertionUtil } from "./type-assertion";
import * as BigJs from "big.js";
// Nambır nambır altmış yedii
export type NumberLike = number | BigJs.Big;
export class AmountCalculationUtil {

    static addNumberValues(...values: Array<NumberLike>): BigJs.Big {
        let total = new BigJs.Big(0);
        for (let i = 0; i < values.length; i++) {
            let value = values[i];
            TypeAssertionUtil.assertIsNumber(
                value,
                `Value at index ${i} must be a number`,
            );
            total = total.plus(new BigJs.Big(value));
        }
        return total;
    }

    static minusNumberValues(initialValue: NumberLike, ...values: Array<NumberLike>): BigJs.Big {
        TypeAssertionUtil.assertIsNumber(
            initialValue,
            'Initial value must be a number',
        );
        let val = new BigJs.Big(initialValue);
        for (let i = 0; i < values.length; i++) {
            let value = values[i];
            TypeAssertionUtil.assertIsNumber(
                value,
                `Value at index ${i} must be a number`,
            );
            val = val.minus(new BigJs.Big(value));
        }
        return val;

    }

    static multiplyNumberValues(...values: Array<NumberLike>): BigJs.Big {
        let startValue = new BigJs.Big(1);
        for (let i = 0; i < values.length; i++) {
            let multiplierItem = values[i];
            TypeAssertionUtil.assertIsNumber(
                multiplierItem,
                `Value at index ${i} must be a number`,
            );
            startValue = startValue.times(multiplierItem);
        }
        return startValue;
    }

    


    static divideNumberValues(initialValue: NumberLike, ...values: Array<NumberLike>): BigJs.Big {
        if (new BigJs.Big(initialValue).eq(0)) {
            return new BigJs.Big(0); // If the initial value is zero, return zero to avoid division by zero
        }

        TypeAssertionUtil.assertIsNumber(
            initialValue,
            'Initial value must be a number',
        );

        const divisor = this.multiplyNumberValues(...values);
        if (divisor.eq(0)) {
            throw new Error('Division by zero is not allowed');
        }
        return new BigJs.Big(initialValue).div(divisor);

    }

    static calculateComissionAmountByPercent(amount: NumberLike, percent: NumberLike): BigJs.Big {
        TypeAssertionUtil.assertIsNumber(
            amount,
            'Amount must be a number',
        );
        TypeAssertionUtil.assertIsNumber(
            percent,
            'Percent must be a number',
        );
        return this.divideNumberValues(this.multiplyNumberValues(amount, percent), 100);
    }

    static toFixedNumber(value: NumberLike, decimalPlaces: number = 2): number {
        TypeAssertionUtil.assertIsNumber(
            value,
            'Value must be a number',
        );
        const bigValue = new BigJs.Big(value);
        return parseFloat(bigValue.toFixed(decimalPlaces));
    }

}