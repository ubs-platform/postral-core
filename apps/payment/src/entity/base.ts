import Big = require('big.js');
export const MoneyDbField = {
    type: 'decimal' as 'decimal',
    precision: 19, scale: 4, default: 0,
    transformer: {
        from: (v) => (new Big(v || 0)).toNumber(),
        to: (v) => (new Big(v || 0)).toFixed(4),
    }
};

export const BigintDbField = {
    type: "bigint" as "bigint", default: 0, transformer: {
        to: (value: number) => value,
        from: (value: string | number | null): number => {
            if (value === null) {
                return 0;
            }
            const parsed = typeof value === "number" ? value : Number(value);
            if (!Number.isSafeInteger(parsed)) {
                throw new Error("ReportTaxGroup.paymentCount exceeds Number.MAX_SAFE_INTEGER");
            }
            return parsed;
        },
    }
}