import { AmountCalculationUtil } from './amount-calculations';

describe('AmountCalculationUtil', () => {

    // ─────────────────────────────────────────────────────────────
    // addNumberValues
    // ─────────────────────────────────────────────────────────────
    describe('addNumberValues', () => {
        it('iki pozitif sayıyı toplar', () => {
            expect(AmountCalculationUtil.addNumberValues(10, 20)).toBe(30);
        });

        it('floating point hassasiyeti: 0.1 + 0.2 = 0.3', () => {
            // Vanilla JS'de 0.1 + 0.2 === 0.30000000000000004; BigJs bunu düzeltir.
            expect(AmountCalculationUtil.addNumberValues(0.1, 0.2)).toBe(0.3);
        });

        it('negatif sayıları toplar', () => {
            expect(AmountCalculationUtil.addNumberValues(-5, -3)).toBe(-8);
        });

        it('sıfır ile toplar', () => {
            expect(AmountCalculationUtil.addNumberValues(0, 42)).toBe(42);
        });

        it('tek argüman kendisini döndürür', () => {
            expect(AmountCalculationUtil.addNumberValues(99)).toBe(99);
        });

        it('ikiden fazla argümanı toplar', () => {
            expect(AmountCalculationUtil.addNumberValues(1, 2, 3, 4)).toBe(10);
        });

        it('NaN geçince hata fırlatır', () => {
            expect(() => AmountCalculationUtil.addNumberValues(NaN, 5)).toThrow();
        });
    });

    // ─────────────────────────────────────────────────────────────
    // minusNumberValues
    // ─────────────────────────────────────────────────────────────
    describe('minusNumberValues', () => {
        it('basit çıkarma', () => {
            expect(AmountCalculationUtil.minusNumberValues(10, 3)).toBe(7);
        });

        it('floating point hassasiyeti: 0.3 - 0.1 = 0.2', () => {
            expect(AmountCalculationUtil.minusNumberValues(0.3, 0.1)).toBe(0.2);
        });

        it('birden fazla argümanı sırayla çıkarır', () => {
            // 100 - 30 - 20 = 50
            expect(AmountCalculationUtil.minusNumberValues(100, 30, 20)).toBe(50);
        });

        it('sıfırdan çıkarınca negatif döner', () => {
            expect(AmountCalculationUtil.minusNumberValues(0, 5)).toBe(-5);
        });

        it('aynı sayıyı çıkarınca sıfır döner', () => {
            expect(AmountCalculationUtil.minusNumberValues(7, 7)).toBe(0);
        });

        it('başlangıç değeri NaN ise hata fırlatır', () => {
            expect(() => AmountCalculationUtil.minusNumberValues(NaN, 5)).toThrow();
        });
    });

    // ─────────────────────────────────────────────────────────────
    // multiplyNumberValues
    // ─────────────────────────────────────────────────────────────
    describe('multiplyNumberValues', () => {
        it('iki sayıyı çarpar', () => {
            expect(AmountCalculationUtil.multiplyNumberValues(6, 7)).toBe(42);
        });

        it('floating point hassasiyeti: 0.1 * 3 = 0.3', () => {
            expect(AmountCalculationUtil.multiplyNumberValues(0.1, 3)).toBe(0.3);
        });

        it('sıfır ile çarpınca sıfır döner', () => {
            expect(AmountCalculationUtil.multiplyNumberValues(999, 0)).toBe(0);
        });

        it('tek argüman kimlik eleman gibi davranır (başlangıç 1 ile çarpılır)', () => {
            expect(AmountCalculationUtil.multiplyNumberValues(5)).toBe(5);
        });

        it('üç argümanı çarpar', () => {
            expect(AmountCalculationUtil.multiplyNumberValues(2, 3, 4)).toBe(24);
        });
    });

    // ─────────────────────────────────────────────────────────────
    // divideNumberValues
    // ─────────────────────────────────────────────────────────────
    describe('divideNumberValues', () => {
        it('basit bölme', () => {
            expect(AmountCalculationUtil.divideNumberValues(10, 2)).toBe(5);
        });

        it('initialValue sıfır ise sıfır döner (sıfıra bölme hatası fırlatmaz)', () => {
            expect(AmountCalculationUtil.divideNumberValues(0, 5)).toBe(0);
        });

        it('divisor sıfır ise "Division by zero" hatası fırlatır', () => {
            expect(() => AmountCalculationUtil.divideNumberValues(10, 0)).toThrow('Division by zero is not allowed');
        });

        it('çok argümanlı kullanımda bölenler çarpılır: (10, 2, 5) = 10/(2*5) = 1', () => {
            // BELGE: divideNumberValues(10, 2, 5) = 10 / (2 * 5) = 1
            // Bu API, payment servisinde oran hesaplamalarında kullanılır.
            expect(AmountCalculationUtil.divideNumberValues(10, 2, 5)).toBe(1);
        });

        it('floating point hassasiyeti: 1/3 sonucu BigJs precision ile döner', () => {
            const result = AmountCalculationUtil.divideNumberValues(1, 3);
            // Kesin değer yerine yaklaşık doğruluk kontrolü
            expect(result).toBeCloseTo(0.3333333, 5);
        });

        it('komisyon oranı hesabı: sellerFee = providerFee * (sellerAmount / totalAmount)', () => {
            // Gerçek dünya: providerFee=100, sellerAmount=300, totalAmount=1000
            // oran = 300/1000 = 0.3, sellerFee = 100 * 0.3 = 30
            const ratio = AmountCalculationUtil.divideNumberValues(300, 1000);
            const sellerFee = AmountCalculationUtil.multiplyNumberValues(100, ratio);
            expect(sellerFee).toBe(30);
        });
    });

    // ─────────────────────────────────────────────────────────────
    // calculateComissionAmountByPercent
    // ─────────────────────────────────────────────────────────────
    describe('calculateComissionAmountByPercent', () => {
        it('%10 komisyon: 100 * 10/100 = 10', () => {
            expect(AmountCalculationUtil.calculateComissionAmountByPercent(100, 10)).toBe(10);
        });

        it('amount sıfır ise komisyon sıfır döner', () => {
            expect(AmountCalculationUtil.calculateComissionAmountByPercent(0, 10)).toBe(0);
        });

        it('percent sıfır ise komisyon sıfır döner', () => {
            // 100 * 0 / 100 = 0; ancak divideNumberValues(0, 100) = 0 yolunu değil
            // multiplyNumberValues(100, 0) = 0 olduğu için divideNumberValues(0, 100) gelir → 0
            expect(AmountCalculationUtil.calculateComissionAmountByPercent(100, 0)).toBe(0);
        });

        it('%7.5 komisyon: 100 * 7.5/100 = 7.5', () => {
            expect(AmountCalculationUtil.calculateComissionAmountByPercent(100, 7.5)).toBe(7.5);
        });

        it('floating point: 1000 * 0.1/100 = 1', () => {
            expect(AmountCalculationUtil.calculateComissionAmountByPercent(1000, 0.1)).toBeCloseTo(1, 10);
        });
    });
});
