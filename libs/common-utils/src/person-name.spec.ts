import { splitPersonName } from './person-name';

describe('splitPersonName', () => {
    it('iki kelimede son kelimeyi soyad alır', () => {
        expect(splitPersonName('Ayşe Kaya')).toEqual({ givenName: 'Ayşe', familyName: 'Kaya' });
    });

    it('birden fazla addan sonra yalnızca son kelimeyi soyad alır', () => {
        expect(splitPersonName('Ayşe Nur Kaya')).toEqual({ givenName: 'Ayşe Nur', familyName: 'Kaya' });
    });

    it('son iki kelime büyük harfliyse ikisini soyad alır', () => {
        expect(splitPersonName('Ayşe ÖZ DEMİR')).toEqual({ givenName: 'Ayşe', familyName: 'ÖZ DEMİR' });
    });

    it('yalnızca son kelime büyük harfliyse tek kelime soyad alır', () => {
        expect(splitPersonName('Ayşe Nur KAYA')).toEqual({ givenName: 'Ayşe Nur', familyName: 'KAYA' });
    });

    it('iki kelimelik tamamen büyük harfli adı bölmez', () => {
        expect(splitPersonName('AYŞE KAYA')).toEqual({ givenName: 'AYŞE', familyName: 'KAYA' });
    });

    it('fazla boşlukları yok sayar', () => {
        expect(splitPersonName('  Ayşe   Kaya ')).toEqual({ givenName: 'Ayşe', familyName: 'Kaya' });
    });

    it('tek kelimede null döner', () => {
        expect(splitPersonName('Ayşe')).toBeNull();
        expect(splitPersonName('  ')).toBeNull();
    });
});
