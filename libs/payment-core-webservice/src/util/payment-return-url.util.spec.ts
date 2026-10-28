import { BadRequestException } from '@nestjs/common';
import {
    appendReturnParams,
    normalizeReturnOrigins,
    operationReturnPath,
    validateReturnUrl,
    withChannelReturnUrl,
} from './payment-return-url.util';

describe('payment return URL utilities', () => {
    describe('normalizeReturnOrigins', () => {
        it('normalizes and deduplicates origins', () => {
            expect(normalizeReturnOrigins([' https://App.example.com/ ', 'https://app.example.com', 'http://localhost:4200']))
                .toEqual(['https://app.example.com', 'http://localhost:4200']);
            expect(normalizeReturnOrigins(undefined)).toEqual([]);
        });

        it.each([
            [['https://app.example.com/path']],
            [['https://app.example.com/?x=1']],
            [['javascript:alert(1)']],
            [['https://user:pass@app.example.com']],
            [['app.example.com']],
            [[42]],
            ['https://app.example.com'],
        ])('rejects %p', input => {
            expect(() => normalizeReturnOrigins(input)).toThrow(BadRequestException);
        });
    });

    describe('validateReturnUrl', () => {
        it('allows any http(s) origin outside production, even with an empty whitelist', () => {
            expect(validateReturnUrl('http://localhost:4200/return?x=1', [], false))
                .toBe('http://localhost:4200/return?x=1');
        });

        it('requires a whitelisted origin in production', () => {
            expect(validateReturnUrl('https://app.example.com/return', ['https://app.example.com'], true))
                .toBe('https://app.example.com/return');
            expect(() => validateReturnUrl('https://evil.example.com/return', ['https://app.example.com'], true))
                .toThrow('redirectUrl origin is not allowed');
            expect(() => validateReturnUrl('https://app.example.com/return', [], true))
                .toThrow('Allowed return origins are not configured');
            expect(() => validateReturnUrl('https://app.example.com/return', undefined, true))
                .toThrow('Allowed return origins are not configured');
        });

        it.each(['/relative', 'javascript:alert(1)', 'https://u:p@app.example.com/', '', 5])(
            'rejects %p',
            value => {
                expect(() => validateReturnUrl(value, ['https://app.example.com'], false)).toThrow(BadRequestException);
            },
        );
    });

    it('builds channel URLs that send the browser to the Postral return endpoint', () => {
        const returnPath = operationReturnPath('op-1');
        expect(returnPath).toBe('/service/payment/api/payment/operation/op-1/return');
        expect(withChannelReturnUrl('dummy-ecommerce-payment-channel/operation/x', returnPath))
            .toBe('/service/payment/api/dummy-ecommerce-payment-channel/operation/x?redirectUrl=%2Fservice%2Fpayment%2Fapi%2Fpayment%2Foperation%2Fop-1%2Freturn');
        expect(withChannelReturnUrl('/service/payment/api/iyzico/operation/y?a=1', returnPath))
            .toBe('/service/payment/api/iyzico/operation/y?a=1&redirectUrl=%2Fservice%2Fpayment%2Fapi%2Fpayment%2Foperation%2Fop-1%2Freturn');
        expect(withChannelReturnUrl('https://pay.example.com/checkout', returnPath))
            .toBe('https://pay.example.com/checkout?redirectUrl=%2Fservice%2Fpayment%2Fapi%2Fpayment%2Foperation%2Fop-1%2Freturn');
    });

    it('appends result parameters while preserving query and fragment', () => {
        expect(appendReturnParams('https://app.example.com/r?x=1#top', { paymentId: 'p', status: 'COMPLETED' }))
            .toBe('https://app.example.com/r?x=1&paymentId=p&status=COMPLETED#top');
    });
});
