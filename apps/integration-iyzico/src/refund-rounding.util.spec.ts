import { refundProviderAmount, refundRoundingMode } from './refund-rounding.util';

describe('iyzico refund precision', () => {
    it.each([
        ['ROUND', 3.3333, '3.33'], ['ROUND', 3.335, '3.34'],
        ['FLOOR', 3.3333, '3.34'], ['FLOOR', 3.335, '3.34'],
        ['USE_FIRST_TWO', 3.3399, '3.33'], ['USE_FIRST_TWO', 3.335, '3.33'],
        ['ROUND', 0.005, '0.01'], ['FLOOR', 0.0001, '0.01'],
    ] as const)('%s normalizes %s to %s', (mode, amount, expected) => {
        expect(refundProviderAmount(amount, mode)).toBe(expected);
    });

    it.each(['ROUND', 'FLOOR', 'USE_FIRST_TWO', 'THROW'] as const)('leaves cent-exact values unchanged under %s', mode => {
        expect(refundProviderAmount(3.33, mode)).toBe('3.33');
        expect(refundProviderAmount(10, mode)).toBe('10.00');
    });

    it('rejects invalid policies, excessive precision, nonfinite, zero and negative amounts', () => {
        expect(refundRoundingMode(undefined)).toBe('THROW');
        for (const value of ['', 'round', 'CEIL', 'UNKNOWN']) {
            expect(() => refundRoundingMode(value)).toThrow('IYZICO_REFUND_ROUNDING_MODE');
        }
        for (const value of [0, -1, NaN, Infinity, 1.00001]) {
            expect(() => refundProviderAmount(value, 'ROUND')).toThrow();
        }
        expect(() => refundProviderAmount(3.3333, 'THROW')).toThrow('two-decimal');
        expect(() => refundProviderAmount(0.0049, 'ROUND')).toThrow('zero');
        expect(() => refundProviderAmount(0.0099, 'USE_FIRST_TWO')).toThrow('zero');
    });

    it('normalizes exact decimal strings without a number conversion', () => {
        expect(refundProviderAmount('3.3350', 'ROUND')).toBe('3.34');
        expect(refundProviderAmount('999999999999999.9999', 'USE_FIRST_TWO')).toBe('999999999999999.99');
        for (const value of ['', 'NaN', 'Infinity', '-1', '0', '1.00001']) {
            expect(() => refundProviderAmount(value, 'ROUND')).toThrow();
        }
    });
});
