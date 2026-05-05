import { TypeAssertionUtil } from "../type-assertion";
import * as BigJs from "big.js";
export class AmountCalculationUtil {

    static addNumberValues(...values: number[]): number {
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
        return Number(total);
    }

    static minusNumberValues(initialValue: number, ...values: number[]): number {
        TypeAssertionUtil.assertIsNumber(
            initialValue,
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
        return Number(val);

    }

    static multiplyNumberValues(...values: number[]): number {
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
        return Number(startValue);
    }

    


    static divideNumberValues(initialValue: number, ...values: number[]): number {
        if (initialValue === 0) {
            return 0; // If the initial value is zero, return zero to avoid division by zero
        }

        TypeAssertionUtil.assertIsNumber(
            initialValue,
            'Initial value must be a number',
        );

        const divisor = this.multiplyNumberValues(...values);
        if (divisor === 0) {
            throw new Error('Division by zero is not allowed');
        }
        return new BigJs(initialValue).div(divisor).toNumber();

    }

    static calculateComissionAmountByPercent(amount: number, percent: number): number {
        amount = Number(amount);
        percent = Number(percent);
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

}