export interface SplitPersonName {
    givenName: string;
    familyName: string;
}

const isUppercaseWord = (word: string) =>
    word === word.toLocaleUpperCase('tr-TR') &&
    word !== word.toLocaleLowerCase('tr-TR');

/**
 * Tek alanlı ad soyadı ayırır. Üç veya daha fazla kelimede son iki kelime de
 * tamamen büyük harfliyse ikisi birlikte soyad sayılır (örn. "Ayşe Kaya ÖZ DEMİR");
 * aksi halde yalnızca son kelime soyaddır. Tek kelimelik adda `null` döner.
 */
export function splitPersonName(fullName: string): SplitPersonName | null {
    const words = fullName.trim().split(/\s+/).filter(Boolean);
    if (words.length < 2) {
        return null;
    }
    const familyWordCount =
        words.length >= 3 && words.slice(-2).every(isUppercaseWord) ? 2 : 1;
    return {
        givenName: words.slice(0, -familyWordCount).join(' '),
        familyName: words.slice(-familyWordCount).join(' '),
    };
}
