export class TypeAssertionUtil {
    static assertIsNumber(
        value: any,
        errorMessage: string = 'Value is not a number',
    ): asserts value is number {
        if (typeof value !== 'number' || isNaN(value)) {
            debugger
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