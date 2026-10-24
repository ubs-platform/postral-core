import { ReportItem } from './report-item.entity';

describe('ReportItem identity', () => {
    it('preserves existing catalog-ID keys and ignores product names when an ID exists', () => {
        expect(ReportItem.generateKey('report', 'item', 'blue', 'Old name')).toBe('report_item_blue');
        expect(ReportItem.generateKey('report', 'item', 'blue', 'New name')).toBe('report_item_blue');
    });

    it('normalizes case and whitespace for names without catalog IDs', () => {
        const key = ReportItem.generateKey('report', '', '', '  Test   Product  ');
        expect(key).toBe(ReportItem.generateKey('report', null, null, 'test product'));
        expect(key).toBe(ReportItem.generateKey('report', undefined, undefined, 'TEST PRODUCT'));
        expect(key).toBe(ReportItem.generateKey('report', '   ', '', 'test product'));
        expect(key).toContain(':no-id:');
    });

    it('keeps different names, variations and reports separate', () => {
        const key = ReportItem.generateKey('report', '', 'blue', 'Product');
        expect(key).not.toBe(ReportItem.generateKey('report', '', 'blue', 'Other product'));
        expect(key).not.toBe(ReportItem.generateKey('report', '', 'red', 'Product'));
        expect(key).not.toBe(ReportItem.generateKey('other-report', '', 'blue', 'Product'));
        expect(ReportItem.generateKey('report', '', 'b_c', 'a'))
            .not.toBe(ReportItem.generateKey('report', '', 'c', 'a_b'));
        expect(key).not.toBe(ReportItem.generateKey('report', 'Product#no-id', 'blue', 'Product'));
    });

    it('bounds name-based keys even when the name and variation reach their column limits', () => {
        expect(ReportItem.generateKey('r'.repeat(36), '', 'v'.repeat(600), 'n'.repeat(600)).length).toBeLessThanOrEqual(600);
    });

    it('rejects an item without either identity rather than merging unnamed products', () => {
        expect(() => ReportItem.generateKey('report', '', '', '  ')).toThrow('without an ID or name');
        expect(() => ReportItem.generateKey('report', undefined, '')).toThrow('without an ID or name');
    });

    it('uses the same fallback in the entity factory', () => {
        const item = ReportItem.create('report', '', 'Product', '', 120, 20, 0, 10);
        expect(item).toMatchObject({
            reportId: 'report', itemId: '', itemName: 'Product', identifiedByName: true,
            reportItemKey: ReportItem.generateKey('report', '', '', 'Product'),
        });
    });
});
