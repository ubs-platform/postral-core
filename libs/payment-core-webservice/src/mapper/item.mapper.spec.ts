import { Item } from '@tk-postral/postral-entities';
import { ItemDTO } from '@tk-postral/payment-common';
import { ItemMapper } from './item.mapper';

describe('Item details', () => {
    const mapper = new ItemMapper();
    const details = {
        isPhysical: true,
        metaEntityGroup: 'CATALOG',
        metaEntityName: 'LAPTOP',
        metaEntityId: 'Thinkpad-E14',
    };
    const input: ItemDTO = {
        id: 'item', name: 'Thinkpad E14', unit: 'C62', baseCurrency: 'TRY',
        sellerAccountId: 'seller', itemTaxId: 'tax', ...details,
    };

    it('round-trips physical and shared metadata fields', async () => {
        const entity = await mapper.updateEntity(new Item(), input);
        expect(entity).toMatchObject(details);
        expect(await mapper.toDto(entity)).toMatchObject(details);
    });

    it('allows different seller items to reference the same metadata', async () => {
        const first = await mapper.updateEntity(new Item(), input);
        const second = await mapper.updateEntity(new Item(), { ...input, sellerAccountId: 'other' });
        expect(second.metaEntityId).toBe(first.metaEntityId);
        expect(second.sellerAccountId).not.toBe(first.sellerAccountId);
    });

    it('defaults legacy creation to virtual and preserves omitted fields on update', async () => {
        const { isPhysical, metaEntityGroup, metaEntityName, metaEntityId, ...legacy } = input;
        expect((await mapper.updateEntity(new Item(), legacy)).isPhysical).toBe(false);
        const existing = Object.assign(new Item(), details);
        expect(await mapper.updateEntity(existing, legacy)).toMatchObject(details);
    });

    it('supports edit, explicit false and clearing metadata', async () => {
        const entity = Object.assign(new Item(), details);
        await mapper.updateEntityEdit(entity, {
            ...input, isPhysical: false, metaEntityGroup: null, metaEntityName: null, metaEntityId: null,
        });
        expect(await mapper.toDto(entity)).toMatchObject({
            isPhysical: false, metaEntityGroup: null, metaEntityName: null, metaEntityId: null,
        });
    });

    it.each([{ isPhysical: 'false' }, { isPhysical: null }, { metaEntityId: 42 }])(
        'rejects invalid details %p', async (invalid) => {
            await expect(mapper.updateEntity(new Item(), Object.assign({}, input, invalid)))
                .rejects.toThrow();
        },
    );
});
