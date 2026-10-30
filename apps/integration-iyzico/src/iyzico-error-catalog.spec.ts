import {
    describeIyzicoError,
    findIyzicoError,
    IYZICO_ERROR_CATALOG,
} from './iyzico-error-catalog';

describe('iyzico error catalog', () => {
    it('her kod ve grup çifti bir kez bulunur', () => {
        const keys = IYZICO_ERROR_CATALOG.map(
            (info) => `${info.code ?? ''}|${info.group ?? ''}`,
        );
        expect(new Set(keys).size).toBe(keys.length);
    });

    it('her kayıt kod veya grup ile tanımlıdır', () => {
        for (const info of IYZICO_ERROR_CATALOG) {
            expect(info.code || info.group).toBeTruthy();
            if (info.code) expect(info.code).toMatch(/^\d+$/);
        }
    });

    it('pazaryeri onboarding hatalarını bulur', () => {
        expect(findIyzicoError('2000')).toMatchObject({
            category: 'MARKETPLACE_ONBOARDING',
            message: expect.stringContaining('pazaryeri'),
        });
    });

    it('aynı kodlu kayıtlardan errorGroup ile doğru olanı seçer', () => {
        expect(findIyzicoError('10041', 'LOST_CARD')?.group).toBe('LOST_CARD');
        expect(findIyzicoError('10041', 'PICKUP_CARD')?.group).toBe('PICKUP_CARD');
        expect(findIyzicoError('10041')).toBeDefined();
    });

    it('bilinmeyen kodda undefined ve boş açıklama döner', () => {
        expect(findIyzicoError('999999')).toBeUndefined();
        expect(describeIyzicoError('UNKNOWN')).toBe('');
    });

    it('açıklamayı mesaj ile birleştirir', () => {
        expect(describeIyzicoError('1000')).toContain('Geçersiz imza');
    });
});
