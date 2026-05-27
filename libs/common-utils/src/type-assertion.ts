import * as BigJs from "big.js";
export class TypeAssertionUtil {
    static assertIsNumber(
        value: any,
        errorMessage: string = 'Value is not a number',
    ): asserts value is number | BigJs.Big {
        const isNumericString = typeof value === 'string' && !isNaN(Number(value));
        if (typeof value !== 'number' && !(value instanceof BigJs.Big) && !isNumericString) {
            // exec(`kdialog --msgbox 'Value is not a number, type is ${typeof value}'`);
            throw new Error(errorMessage);
        }
    }

    static assertIsString(
        value: any,
        errorMessage: string = 'Value is not a string',
    ): asserts value is string {
        if (typeof value !== 'string') {
            throw new Error(errorMessage);
        }
    }

    static assertIsArray<T>(
        value: any,
        errorMessage: string = 'Value is not an array',
    ): asserts value is T[] {
        if (!Array.isArray(value)) {
            throw new Error(errorMessage);
        }
    }
}