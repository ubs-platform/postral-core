import { itemDetailFilters } from './item-detail-filters';

describe('Item detail filters', () => {
    it('keeps omitted flags unfiltered and supports explicit false', () => {
        expect(itemDetailFilters()).toEqual({});
        expect(itemDetailFilters({ isPhysical: 'false' })).toEqual({ isPhysical: false });
        expect(itemDetailFilters({ isPhysical: 'true' })).toEqual({ isPhysical: true });
    });

    it('supports independent and combined metadata equality filters', () => {
        expect(itemDetailFilters({ metaEntityId: 'Thinkpad-E14' }))
            .toEqual({ metaEntityId: 'Thinkpad-E14' });
        const search = {
            metaEntityGroup: 'CATALOG', metaEntityName: 'LAPTOP', metaEntityId: 'Thinkpad-E14',
        };
        expect(itemDetailFilters(search)).toEqual(search);
    });

    it('rejects invalid physical filters', () => {
        expect(() => itemDetailFilters(Object.assign({}, { isPhysical: 'yes' })))
            .toThrow('isPhysical filter must be true or false');
    });
});
