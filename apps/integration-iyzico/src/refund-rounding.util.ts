import { BadRequestException } from '@nestjs/common';
import Big from 'big.js';

export type RefundRoundingMode = 'ROUND' | 'FLOOR' | 'USE_FIRST_TWO' | 'THROW';

export function refundRoundingMode(value: string | undefined): RefundRoundingMode {
    if (value === undefined) return 'THROW';
    if (value === 'ROUND' || value === 'FLOOR' || value === 'USE_FIRST_TWO' || value === 'THROW') {
        return value;
    }
    throw new Error('Invalid IYZICO_REFUND_ROUNDING_MODE; expected ROUND, FLOOR, USE_FIRST_TWO or THROW');
}

export function refundProviderAmount(amount: number | string, mode: RefundRoundingMode): string {
    if ((typeof amount === 'number' && !Number.isFinite(amount)) ||
        (typeof amount === 'string' && !/^\d+(\.\d+)?$/.test(amount))) {
        throw new BadRequestException('Refund amount must be positive and finite');
    }
    const nominal = new Big(amount);
    if (nominal.lte(0)) throw new BadRequestException('Refund amount must be positive and finite');
    if (!nominal.eq(nominal.round(4))) {
        throw new BadRequestException('Refund amount exceeds four-decimal precision');
    }
    if (mode === 'THROW' && !nominal.eq(nominal.round(2))) {
        throw new BadRequestException('iyzico refund requires two-decimal amounts under THROW');
    }
    // FLOOR is the configured name for upward rounding, intentionally matching the channel contract.
    const rounded = nominal.round(2, mode === 'ROUND' ? 1 : mode === 'FLOOR' ? 3 : 0);
    if (rounded.lte(0)) {
        throw new BadRequestException('iyzico refund becomes zero under the configured rounding policy');
    }
    return rounded.toFixed(2);
}
