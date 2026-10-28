import { Test } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { getMetadataArgsStorage } from 'typeorm';
import { Item, PostralPaymentItem } from '@tk-postral/postral-entities';
import { ItemDTO } from '@tk-postral/payment-common';
import { ItemService } from './item.service';
import { ItemCrudService } from './item-crud.service';
import { AccountService } from './account.service';
import { ItemTaxService } from './item-tax.service';
import { ItemPriceService } from './item-price.service';
import { AppComissionService } from './app-commission.service';
import { AdminSettingsService } from './admin-settings.service';
import { OrderCalculationService } from './order-calculation.service';
import { PaymentItemSearchService } from './payment-item-search.service';
import { ItemMapper } from '../mapper/item.mapper';
import { PaymentItemMapper } from '../mapper/payment-item.mapper';
import { InvoiceAccountMapper } from '../mapper/invoice-account.mapper';
import { InvoiceAddressMapper } from '../mapper/invoice-address.mapper';
import { EntityOwnershipService } from '@ubs-platform/users-microservice-helper';
import { AuthUtilService } from './auth-util.service';

describe('Item details through payment persistence and search', () => {
    const details = {
        isPhysical: true, metaEntityGroup: 'CATALOG',
        metaEntityName: 'LAPTOP', metaEntityId: 'Thinkpad-E14',
    };
    const catalogItem: ItemDTO = {
        id: 'catalog-item', name: 'Thinkpad', sellerAccountId: 'seller',
        itemTaxId: 'tax', unit: 'C62', baseCurrency: 'TRY', ...details,
    };
    const itemRepo = { find: jest.fn() };
    const paymentItemRepo = { find: jest.fn() };
    let calculations: OrderCalculationService;
    let mapper: PaymentItemMapper;
    let itemService: ItemService;
    let crud: ItemCrudService;
    let search: PaymentItemSearchService;

    beforeEach(async () => {
        jest.clearAllMocks();
        itemRepo.find.mockResolvedValue([Object.assign(new Item(), catalogItem)]);
        paymentItemRepo.find.mockResolvedValue([]);
        const module = await Test.createTestingModule({
            providers: [
                OrderCalculationService, ItemService, ItemCrudService,
                ItemMapper, PaymentItemMapper, PaymentItemSearchService,
                { provide: getRepositoryToken(Item), useValue: itemRepo },
                { provide: getRepositoryToken(PostralPaymentItem), useValue: paymentItemRepo },
                { provide: InvoiceAccountMapper, useValue: {} },
                { provide: InvoiceAddressMapper, useValue: {} },
                { provide: EntityOwnershipService, useValue: {} },
                { provide: AuthUtilService, useValue: {} },
                { provide: AccountService, useValue: { fetchOne: jest.fn().mockResolvedValue({ type: 'COMMERCIAL' }) } },
                { provide: ItemTaxService, useValue: {
                    fetchOne: jest.fn().mockResolvedValue({ taxName: 'VAT', variations: [{ taxMode: 'DEFAULT', taxRate: 20 }] }),
                } },
                { provide: ItemPriceService, useValue: {
                    allLatestPrices: jest.fn().mockResolvedValue([{ variation: 'default', itemPrice: 120 }]),
                    allDefaultPrices: jest.fn().mockResolvedValue([{ variation: 'default', itemPrice: 120 }]),
                } },
                { provide: AppComissionService, useValue: { fetchOneForCalculation: jest.fn().mockResolvedValue({ percent: 0 }) } },
                { provide: AdminSettingsService, useValue: { getAdminSettings: jest.fn().mockResolvedValue({ comissionsCalculatedFromNet: false }) } },
            ],
        }).compile();
        calculations = module.get(OrderCalculationService);
        mapper = module.get(PaymentItemMapper);
        itemService = module.get(ItemService);
        crud = module.get(ItemCrudService);
        search = module.get(PaymentItemSearchService);
    });

    it('copies authoritative catalog values into persisted payment items and reads them back', async () => {
        const result = await calculations.calculateTotalAmount({
            currency: 'TRY', saleMode: 'DEFAULT',
            items: [{ itemId: catalogItem.id, quantity: 1, variation: 'default' }],
        });
        expect(result.items[0]).toMatchObject(details);
        const entity = mapper.toEntity(result.items[0]);
        expect(entity).toMatchObject(details);
        catalogItem.metaEntityId = 'changed-after-purchase';
        expect(mapper.toDto([entity])[0]).toMatchObject(details);
        catalogItem.metaEntityId = details.metaEntityId;
    });

    it('round-trips explicit false and defaults missing legacy physical flags', () => {
        const legacy = mapper.toDto([new PostralPaymentItem()])[0];
        expect(legacy.isPhysical).toBe(false);
        delete legacy.isPhysical;
        expect(mapper.toEntity(legacy).isPhysical).toBe(false);
    });

    it('wires meta and physical filters into catalog and payment-item queries', async () => {
        const criteria = {
            metaEntityGroup: 'CATALOG', metaEntityName: 'LAPTOP',
            metaEntityId: 'Thinkpad-E14', isPhysical: 'false' as const,
        };
        const expected = { ...criteria, isPhysical: false };
        await itemService.fetchAll(criteria);
        expect(itemRepo.find).toHaveBeenCalledWith({ where: expected });
        expect(await crud.searchParams(criteria, { id: 'user', roles: [] }))
            .toEqual(expected);
        await search.findItemsByCriteria(criteria);
        expect(paymentItemRepo.find).toHaveBeenCalledWith({ where: expected });
    });

    it('declares a non-unique catalog meta index and backwards-compatible columns', () => {
        const metadata = getMetadataArgsStorage();
        expect(metadata.indices.find(index => index.target === Item &&
            JSON.stringify(index.columns) === JSON.stringify(['metaEntityGroup', 'metaEntityName', 'metaEntityId'])))
            .toMatchObject({ unique: false });
        for (const target of [Item, PostralPaymentItem]) {
            expect(metadata.columns.find(column => column.target === target && column.propertyName === 'isPhysical')?.options)
                .toMatchObject({ default: false });
            for (const field of ['metaEntityGroup', 'metaEntityName', 'metaEntityId']) {
                expect(metadata.columns.find(column => column.target === target && column.propertyName === field)?.options)
                    .toMatchObject({ nullable: true });
            }
        }
    });
});
