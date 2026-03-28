import { TypeAssertionUtil } from "../type-assertion";

export class ItemCalculationUtil {
    static calculateTotalItemPrice(
        unitPrice: number,
        quantity: number,
    ): number {
        unitPrice = Number(unitPrice);
        quantity = Number(quantity);
        TypeAssertionUtil.assertIsNumber(
            unitPrice,
            'Unit price must be a number',
        );
        TypeAssertionUtil.assertIsNumber(
            quantity,
            'Quantity must be a number',
        );
        return unitPrice * quantity;
    }

    static addNumberValues(...values: number[]): number {
        let total = 0;
        for (let i = 0; i < values.length; i++) {
            let value = values[i];
            value = Number(value);
            TypeAssertionUtil.assertIsNumber(
                value,
                `Value at index ${i} must be a number`,
            );
            total += value;
        }
        return total;
    }

    static minusNumberValues(initialValue: number, ...values: number[]): number {
        let total = initialValue;
        for (let i = 0; i < values.length; i++) {
            let value = values[i];
            value = Number(value);
            TypeAssertionUtil.assertIsNumber(
                value,
                `Value at index ${i} must be a number`,
            );
            total -= value;
        }
        return total;
    }
}