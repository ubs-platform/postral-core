const LIMITED_OR_JOINT_STOCK_SUFFIX =
    /(^|\s)(a\s?ş|anonim\s+şirketi|ltd(\s+şti)?|limited(\s+(şirketi|şti))?)$/;

/**
 * Unvanın sonu A.Ş. / Anonim Şirketi / Ltd. Şti. / Limited Şirketi ile bitiyorsa
 * sermaye şirketi (limited veya anonim) kabul edilir. Şahıs işletmeleri ve
 * unvanından türü anlaşılmayan işletmeler için `false` döner.
 */
export function isLimitedOrJointStockCompanyName(name: string): boolean {
    const normalized = name
        .toLocaleLowerCase('tr-TR')
        .replace(/[.,]/g, ' ')
        .replace(/\s+/g, ' ')
        .trim();
    return LIMITED_OR_JOINT_STOCK_SUFFIX.test(normalized);
}
