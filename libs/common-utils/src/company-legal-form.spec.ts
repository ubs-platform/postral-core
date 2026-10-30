import { isLimitedOrJointStockCompanyName } from './company-legal-form';

describe('isLimitedOrJointStockCompanyName', () => {
    it.each([
        'Foo Yazılım A.Ş.',
        'Foo Yazılım AŞ',
        'FOO YAZILIM A. Ş.',
        'Foo Yazılım Anonim Şirketi',
        'FOO YAZILIM ANONİM ŞİRKETİ',
        'Foo Yazılım Ltd. Şti.',
        'Foo Yazılım LTD.ŞTİ.',
        'Foo Yazılım Ltd',
        'Foo Yazılım Limited Şirketi',
        'FOO YAZILIM LİMİTED ŞİRKETİ',
        'Foo Yazılım Limited',
    ])('%s sermaye şirketidir', (name) => {
        expect(isLimitedOrJointStockCompanyName(name)).toBe(true);
    });

    it.each([
        'Ahmet Yılmaz',
        'Ahmet Yılmaz Kırtasiye',
        'Aş Dükkanı',
        'Çiftltd',
        'Foo Ltd. Şti. Gıda',
        '',
    ])('%s sermaye şirketi değildir', (name) => {
        expect(isLimitedOrJointStockCompanyName(name)).toBe(false);
    });
});
