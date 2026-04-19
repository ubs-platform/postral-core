import Big from 'big.js';
export const MoneyDbField = {
    type: 'decimal' as 'decimal',
    precision: 19, scale: 4, default: 0,
    transformer: {
        from: (v) => (new Big(v || 0)).toNumber(),
        to: (v) => (new Big(v || 0)).toFixed(4),
    }
}; 