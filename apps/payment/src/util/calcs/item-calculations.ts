import { TypeAssertionUtil } from "../type-assertion";

export class ItemCalculationUtil {
    static calculateTotalItemPrice(
        unitPrice: number,
        quantity: number,
    ): number {
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
            const value = values[i];
            TypeAssertionUtil.assertIsNumber(
                value,
                `Value at index ${i} must be a number`,
            );
            total += value;
        }
        return total;
    }
}