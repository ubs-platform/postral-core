import { TypeAssertionUtil } from "../type-assertion";

export class RatioCalculationUtil {

    static calculateRefundRatio(
        refundAmount: number,
        totalPaymentAmount: number,
    ): number {
        TypeAssertionUtil.assertIsNumber(
            refundAmount,
            'Refund amount must be a number',
        );
        TypeAssertionUtil.assertIsNumber(
            totalPaymentAmount,
            'Total payment amount must be a number',
        );
        if (totalPaymentAmount === 0) {
            throw new Error('Total payment amount cannot be zero');
        }
        return refundAmount / totalPaymentAmount;
    }

    static multiplyTwoValues(
        refundAmount: number,
        ratio: number,
    ): number {
        TypeAssertionUtil.assertIsNumber(
            refundAmount,
            'Refund amount must be a number',
        );
        TypeAssertionUtil.assertIsNumber(
            ratio,
            'Ratio must be a number',
        );
        // if (ratio === 0) {
        //     throw new Error('Ratio cannot be zero');
        // }
        return refundAmount * ratio;
    }
}