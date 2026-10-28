import { Test } from '@nestjs/testing';
import { BadRequestException } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { DataSource, FindOperator } from 'typeorm';
import { of, throwError } from 'rxjs';
import { Account, Address, AdminSettings, AppComission, ItemTaxEntity, PaymentChannelConfig, PlatformSetup, ReportQuery } from '@tk-postral/postral-entities';
import { PlatformSetupCompleteDTO, PlatformSetupSettingsDTO } from '@tk-postral/payment-common';
import { UserAuthBackendDTO } from '@ubs-platform/users-common';
import { EntityOwnershipGroupClientService, EntityOwnershipService } from '@ubs-platform/users-microservice-helper';
import { Roles } from '@ubs-platform/users-roles';
import { PlatformSetupService } from './platform-setup.service';
import { PlatformSetupController } from '../controller/platform-setup.controller';
import { AccountMapper } from '../mapper/account.mapper';
import { AddressMapper } from '../mapper/address.mapper';
import { ItemTaxMapper } from '../mapper/item-tax.mapper';
import { SellerReportSetupService } from './seller-report-setup.service';

describe('PlatformSetupService', () => {
    let service: PlatformSetupService;
    let rows: Map<Function, object[]>;
    const bucket = (target: Function) => {
        if (!rows.has(target)) rows.set(target, []);
        return rows.get(target)!;
    };
    const matches = (row: object, where: Record<string, unknown> = {}) => Object.entries(where).every(([key, value]) =>
        value instanceof FindOperator ? Reflect.get(row, key) == null : Reflect.get(row, key) === value);
    const manager = {
        findOne: jest.fn(), findOneBy: jest.fn(), find: jest.fn(), existsBy: jest.fn(),
        create: jest.fn(), save: jest.fn(), insert: jest.fn(), update: jest.fn(),
    };
    const groups = { insert: jest.fn(), checkUserCapability: jest.fn() };
    const ownership = { ensureTeamOwnership: jest.fn() };
    const accountMapper = { updateEntity: jest.fn() };
    const addressMapper = { updateEntity: jest.fn() };
    const sellerReports = { ensureSellerQueries: jest.fn() };
    const user = Object.assign(new UserAuthBackendDTO(), { id: 'admin', roles: ['ADMIN'] });
    const address = { name: 'Office', streetName: 'Street', cityName: 'Istanbul', citySubdivisionName: 'Kadikoy', postalZone: '34000', country: 'TR' };
    const input = { address, account: { id: 'untrusted', name: 'Company', legalIdentity: '1234567890', type: 'COMMERCIAL' as const } };
    const config = (overrides: Partial<PlatformSetupSettingsDTO> = {}): PlatformSetupSettingsDTO => ({
        mode: 'MARKETPLACE', currency: 'TRY', commissionPercent: 12.5, taxRate: 20,
        billingDays: [1, 28], alsoSells: false, sellerReports: true, dateGroupings: ['DAILY', 'MONTHLY', 'YEARLY'], ...overrides,
    });
    const savedState = () => bucket(PlatformSetup)[0] as PlatformSetup;
    const platform = async () => {
        await service.team('Administration', user);
        await service.saveAccount(input, false, user);
    };

    beforeEach(async () => {
        jest.resetAllMocks();
        rows = new Map();
        manager.findOne.mockImplementation(async (target: Function, options: { where: Record<string, unknown> }) => bucket(target).find(row => matches(row, options.where)) ?? null);
        manager.findOneBy.mockImplementation(async (target: Function, where: Record<string, unknown>) => bucket(target).find(row => matches(row, where)) ?? null);
        manager.find.mockImplementation(async (target: Function, options?: { where: Record<string, unknown> }) => bucket(target).filter(row => matches(row, options?.where)));
        manager.existsBy.mockImplementation(async (target: Function, where: Record<string, unknown>) => bucket(target).some(row => matches(row, where)));
        manager.create.mockImplementation((target: new () => object, data: object) => Object.assign(new target(), data));
        manager.save.mockImplementation(async (first: object, second?: object) => {
            const entity = second ?? first;
            const data = bucket(entity.constructor);
            if (!Reflect.get(entity, 'id')) Reflect.set(entity, 'id', `id-${data.length}`);
            const index = data.findIndex(row => Reflect.get(row, 'id') === Reflect.get(entity, 'id'));
            if (index === -1) data.push(entity);
            else data[index] = entity;
            return entity;
        });
        manager.insert.mockImplementation(async (_target: Function, entity: object) => manager.save(entity));
        manager.update.mockImplementation(async (target: Function, where: Record<string, unknown>, update: object) => {
            bucket(target).filter(row => matches(row, where)).forEach(row => Object.assign(row, update));
        });
        groups.insert.mockReturnValue(of({ id: 'team-id' }));
        groups.checkUserCapability.mockReturnValue(of(true));
        ownership.ensureTeamOwnership.mockReturnValue(of(true));
        accountMapper.updateEntity.mockImplementation(async (entity: Account, dto: object) => Object.assign(entity, dto));
        addressMapper.updateEntity.mockImplementation(async (entity: Address, dto: object) => Object.assign(entity, dto));
        let previous = Promise.resolve<unknown>(undefined);
        const transaction = (callback: (m: typeof manager) => Promise<unknown>) => {
            const result = previous.then(() => callback(manager));
            previous = result.catch(() => undefined);
            return result;
        };
        const module = await Test.createTestingModule({ providers: [
            PlatformSetupService, ItemTaxMapper,
            { provide: DataSource, useValue: { manager, transaction } },
            { provide: EntityOwnershipGroupClientService, useValue: groups },
            { provide: EntityOwnershipService, useValue: ownership },
            { provide: AccountMapper, useValue: accountMapper },
            { provide: AddressMapper, useValue: addressMapper },
            { provide: SellerReportSetupService, useValue: sellerReports },
        ] }).compile();
        service = module.get(PlatformSetupService);
    });

    it('reads first-run status without creating system state or admin defaults', async () => {
        expect(await service.status()).toMatchObject({ status: 'NOT_STARTED', step: 'TEAM', legacyAvailable: false });
        expect(manager.save).not.toHaveBeenCalled();
        expect(manager.insert).not.toHaveBeenCalled();
    });

    it.each(['SELF', 'MARKETPLACE'] as const)('creates private DEFAULT additional taxes for %s, independently from commission tax', async mode => {
        await platform();
        const additionalTaxes = [0, 1, 10, 20].map(taxRate => ({ taxName: `VAT ${taxRate}`, taxRate }));
        const settings = config({ mode, additionalTaxes });
        await service.configure(settings, user);
        const ids = [...savedState().additionalTaxIds!];
        expect(ids).toHaveLength(4);
        expect(new Set(ids).size).toBe(4);
        for (const [index, id] of ids.entries()) {
            expect(bucket(ItemTaxEntity).find(row => Reflect.get(row, 'id') === id)).toMatchObject({
                taxName: additionalTaxes[index].taxName, isPublic: false,
                variations: [expect.objectContaining({ taxMode: 'DEFAULT', taxRate: additionalTaxes[index].taxRate })],
            });
            expect(ownership.ensureTeamOwnership).toHaveBeenCalledWith(expect.objectContaining({
                entityName: 'TAX', entityId: id, entityOwnershipGroupId: 'team-id',
            }));
        }
        await service.configure(settings, user);
        await service.complete(user);
        expect(savedState().additionalTaxIds).toEqual(ids);
        expect(bucket(ItemTaxEntity)).toHaveLength(mode === 'SELF' ? 4 : 5);
        const admin = bucket(AdminSettings)[0] as AdminSettings;
        expect(admin.comissionItemTaxId).toBe(mode === 'SELF' ? undefined : savedState().taxId);
    });

    it('repairs additional tax ownership after a lost reply without recreating taxes', async () => {
        await platform();
        const settings = config({ mode: 'SELF', additionalTaxes: [{ taxName: 'VAT', taxRate: 20 }] });
        ownership.ensureTeamOwnership.mockReturnValueOnce(throwError(() => new Error('ownership unavailable')));
        await expect(service.configure(settings, user)).rejects.toThrow('ownership unavailable');
        const id = savedState().additionalTaxIds![0];
        await service.complete(user);
        expect(bucket(ItemTaxEntity)).toHaveLength(1);
        expect(savedState().additionalTaxIds).toEqual([id]);
        expect(ownership.ensureTeamOwnership).toHaveBeenCalledWith(expect.objectContaining({ entityId: id, entityName: 'TAX' }));
        expect((await service.status()).status).toBe('COMPLETED');
    });

    it('allows removing every additional tax and preserves older requests without the field', async () => {
        await platform();
        await service.configure(config({ mode: 'SELF', additionalTaxes: [] }), user);
        await service.complete(user);
        expect(bucket(ItemTaxEntity)).toHaveLength(0);
    });

    it('rejects changed or deleted additional taxes before activating settings', async () => {
        await platform();
        await service.configure(config({ mode: 'SELF', additionalTaxes: [{ taxName: 'VAT', taxRate: 20 }] }), user);
        const tax = bucket(ItemTaxEntity)[0] as ItemTaxEntity;
        tax.variations[0].taxMode = 'OTHER';
        await expect(service.complete(user)).rejects.toThrow('additional tax is missing or changed');
        expect((await service.status()).status).toBe('IN_PROGRESS');
        expect(bucket(AdminSettings)).toHaveLength(0);
    });

    it.each([
        null, 'VAT', [null], [{ taxName: '', taxRate: 20 }], [{ taxName: 'VAT', taxRate: 20.5 }],
        [{ taxName: 'VAT', taxRate: -1 }], [{ taxName: 'VAT', taxRate: 101 }],
        [{ taxName: 'VAT', taxRate: '20' }],
        [{ taxName: ' VAT ', taxRate: 20 }, { taxName: 'vat', taxRate: 10 }],
        Array.from({ length: 51 }, (_, i) => ({ taxName: `VAT ${i}`, taxRate: 20 })),
    ].map(additionalTaxes => ({ additionalTaxes })))('rejects invalid additional taxes %j before writing anything', async ({ additionalTaxes }) => {
        await expect(service.configure(Object.assign(config(), { additionalTaxes }), user)).rejects.toThrow(BadRequestException);
        expect(manager.save).not.toHaveBeenCalled();
    });

    it('adds the selected test channel enabled with devOnly false, only once', async () => {
        await platform();
        await service.configure(config({ mode: 'SELF' }), user);
        const selection = { paymentChannelIds: ['dummy-ecommerce', 'dummy-ecommerce'] };
        await service.complete(user, selection);
        expect(bucket(PaymentChannelConfig)).toHaveLength(1);
        expect(bucket(PaymentChannelConfig)[0]).toMatchObject({
            channelId: 'dummy-ecommerce', enabled: true, devOnly: false,
        });
        await service.complete(user, selection);
        expect(bucket(PaymentChannelConfig)).toHaveLength(1);
    });

    it('does not add any channel when the optional selection is absent or empty', async () => {
        await platform();
        await service.configure(config({ mode: 'SELF' }), user);
        await service.complete(user, { paymentChannelIds: [] });
        expect(bucket(PaymentChannelConfig)).toHaveLength(0);
    });

    it('preserves an existing disabled development-only test channel', async () => {
        const existing = Object.assign(new PaymentChannelConfig(), {
            channelId: 'dummy-ecommerce', enabled: false, devOnly: true, name: 'Custom test channel',
        });
        bucket(PaymentChannelConfig).push(existing);
        await platform();
        await service.configure(config({ mode: 'SELF' }), user);
        await service.complete(user, { paymentChannelIds: ['dummy-ecommerce'] });
        expect(bucket(PaymentChannelConfig)).toEqual([existing]);
        expect(existing).toMatchObject({ enabled: false, devOnly: true, name: 'Custom test channel' });
    });

    it.each([
        { paymentChannelIds: ['paytr'] }, { paymentChannelIds: ['iyzico'] },
        { paymentChannelIds: 'dummy-ecommerce' }, { paymentChannelIds: [null] }, { paymentChannelIds: null },
    ])('rejects unsupported or malformed channel selection %j', async invalid => {
        await expect(service.complete(user, Object.assign(new PlatformSetupCompleteDTO(), invalid))).rejects.toThrow('Unsupported setup payment channel');
        expect(manager.save).not.toHaveBeenCalled();
    });

    it('does not mark setup complete when channel persistence fails', async () => {
        await platform();
        await service.configure(config({ mode: 'SELF' }), user);
        manager.findOneBy.mockImplementation(async (target: Function, where: Record<string, unknown>) => {
            if (target === PaymentChannelConfig) throw new Error('channel database unavailable');
            return bucket(target).find(row => matches(row, where)) ?? null;
        });
        await expect(service.complete(user, { paymentChannelIds: ['dummy-ecommerce'] })).rejects.toThrow('channel database unavailable');
        expect((await service.status()).status).toBe('IN_PROGRESS');
        expect(bucket(AdminSettings)).toEqual([]);
    });

    it('reserves a persistent team retry key before calling users, including a lost response', async () => {
        groups.insert.mockReturnValueOnce(throwError(() => new Error('lost response')));
        await expect(service.team('Administration', user)).rejects.toThrow('lost response');
        expect(savedState().teamName).toBe('Administration');
        const first = groups.insert.mock.calls[0][0];
        await expect(service.team('Different name', user)).rejects.toThrow('original name');
        await service.team('Administration', user);
        expect(groups.insert.mock.calls[1][0].creationKey).toBe(first.creationKey);
        expect(first.initialUserId).toBe(user.id);
        expect(first.initialUserEntityCapabilities.map((item: { entityName: string }) => item.entityName)).toEqual(['ACCOUNT', 'ADDRESS', 'TAX']);
        await service.team('Administration', user);
        expect(groups.insert).toHaveBeenCalledTimes(2);
    });

    it('keeps encrypted mapping boundaries and retries acknowledged ownership without duplicating accounts', async () => {
        await service.team('Administration', user);
        ownership.ensureTeamOwnership.mockReturnValueOnce(throwError(() => new Error('ownership unavailable')));
        await expect(service.saveAccount(input, false, user)).rejects.toThrow('ownership unavailable');
        expect((await service.status()).step).toBe('PLATFORM');
        expect((await service.status()).platformAccountId).toBe(savedState().platformAccountId);
        expect(bucket(Account)).toHaveLength(1);
        await service.saveAccount(input, false, user);
        expect(bucket(Account)).toHaveLength(1);
        expect(bucket(Address)).toHaveLength(1);
        expect(accountMapper.updateEntity).toHaveBeenCalledTimes(1);
        expect(addressMapper.updateEntity).toHaveBeenCalledTimes(1);
        expect(ownership.ensureTeamOwnership).toHaveBeenLastCalledWith(expect.objectContaining({ entityOwnershipGroupId: 'team-id', entityName: 'ACCOUNT' }));
        expect((await service.status()).step).toBe('SETTINGS');
        expect(bucket(Account)[0]).not.toHaveProperty('id', 'untrusted');
    });

    it('normalizes allowed return origins and copies them to admin settings on completion', async () => {
        await platform();
        await service.configure(config({ mode: 'SELF', allowedReturnOrigins: ['https://App.example.com/', 'https://app.example.com'] }), user);
        expect(savedState().settings?.allowedReturnOrigins).toEqual(['https://app.example.com']);
        await service.complete(user);
        expect(bucket(AdminSettings)[0]).toMatchObject({ allowedReturnOrigins: ['https://app.example.com'] });
    });

    it('rejects invalid allowed return origins before writing anything', async () => {
        await expect(service.configure(config({ allowedReturnOrigins: ['https://app.example.com/path'] }), user))
            .rejects.toThrow(BadRequestException);
        expect(manager.save).not.toHaveBeenCalled();
    });

    it('completes own-sales with zero commission and no automatic billing', async () => {
        await platform();
        await service.configure(config({ mode: 'SELF', alsoSells: true }), user);
        expect(bucket(AdminSettings)).toEqual([]);
        expect(bucket(ReportQuery)).toEqual([]);
        const result = await service.complete(user);
        expect(result.status).toBe('COMPLETED');
        expect(result.settings).toMatchObject({ mode: 'SELF', alsoSells: false, commissionPercent: 0, taxRate: 0, billingDays: [] });
        expect(bucket(AppComission)).toHaveLength(2);
        expect(bucket(AppComission).every(row => Reflect.get(row, 'percent') === 0)).toBe(true);
        expect(bucket(AdminSettings)[0]).toMatchObject({ billingAccountId: result.platformAccountId, billingDays: [] });
        expect(bucket(ItemTaxEntity)).toEqual([]);
        expect(sellerReports.ensureSellerQueries).toHaveBeenCalledWith(manager, result.platformAccountId, 'TRY', ['DAILY', 'MONTHLY', 'YEARLY']);
        await service.complete(user);
        expect(bucket(AppComission)).toHaveLength(2);
        expect(sellerReports.ensureSellerQueries).toHaveBeenCalledTimes(1);
    });

    it('completes marketplace with six platform sources, days 1/28 and commission tax', async () => {
        await platform();
        await service.configure(config({ alsoSells: true, billingDays: [28, 1, 1] }), user);
        expect((await service.status()).step).toBe('SELLER');
        expect(bucket(AdminSettings)).toEqual([]);
        await service.saveAccount({ account: { ...input.account, name: 'Our sales' }, usePlatformAddress: true }, true, user);
        expect(bucket(Account)).toHaveLength(2);
        expect(bucket(Address)).toHaveLength(1);
        const result = await service.complete(user);
        expect(result.status).toBe('COMPLETED');
        expect(result.platformAccountId).not.toBe(result.sellerAccountId);
        expect(bucket(ReportQuery)).toHaveLength(6);
        expect(bucket(ReportQuery).every(row => Reflect.get(row, 'ownerAccountId') === result.platformAccountId && Reflect.get(row, 'currency') === 'TRY')).toBe(true);
        expect(bucket(AdminSettings)[0]).toMatchObject({ billingAccountId: result.platformAccountId, billingDays: [1, 28], comissionItemTaxId: savedState().taxId });
        expect(bucket(ItemTaxEntity)[0]).toMatchObject({ variations: [expect.objectContaining({ taxMode: 'DEFAULT', taxRate: 20 })] });
        expect(bucket(AppComission)).toEqual(expect.arrayContaining([
            expect.objectContaining({ percent: 12.5, bias: 1 }),
            expect.objectContaining({ sellerAccountId: result.sellerAccountId, percent: 0, bias: 3 }),
        ]));
        expect(sellerReports.ensureSellerQueries).toHaveBeenCalledWith(manager, result.sellerAccountId, 'TRY', ['DAILY', 'MONTHLY', 'YEARLY']);
    });

    it('supports another currency and a separate seller address without optional seller queries', async () => {
        await platform();
        await service.configure(config({ currency: 'EUR', alsoSells: true, sellerReports: false, dateGroupings: ['DAILY'] }), user);
        await service.saveAccount({ ...input, address: { ...address, name: 'Store' } }, true, user);
        await service.complete(user);
        expect(bucket(Address)).toHaveLength(2);
        expect(bucket(ReportQuery)).toHaveLength(2);
        expect(bucket(ReportQuery).every(row => Reflect.get(row, 'currency') === 'EUR')).toBe(true);
        expect(sellerReports.ensureSellerQueries).not.toHaveBeenCalled();
    });

    it('requires all steps and the initiating administrator', async () => {
        await service.team('Administration', user);
        await expect(service.complete(user)).rejects.toThrow('Complete all');
        await expect(service.saveAccount(input, true, user)).rejects.toThrow('preceding');
        await expect(service.saveAccount(input, false, { ...user, id: 'another-admin' })).rejects.toThrow('administrator who started');
        expect(bucket(Account)).toHaveLength(0);
    });

    it('serializes simultaneous steps with the singleton row lease', async () => {
        await service.team('Administration', user);
        const results = await Promise.allSettled([service.saveAccount(input, false, user), service.saveAccount(input, false, user)]);
        expect(results.filter(result => result.status === 'fulfilled')).toHaveLength(1);
        expect(bucket(Account)).toHaveLength(1);
        expect(manager.findOne).toHaveBeenCalledWith(PlatformSetup, expect.objectContaining({ lock: { mode: 'pessimistic_write' } }));
    });

    it('recovers an expired operation lease but never an active one', async () => {
        await service.team('Administration', user);
        savedState().leaseUntil = new Date(Date.now() + 60000);
        await expect(service.saveAccount(input, false, user)).rejects.toThrow('Another setup operation');
        savedState().leaseUntil = new Date(Date.now() - 1);
        await service.saveAccount(input, false, user);
        expect(bucket(Account)).toHaveLength(1);
    });

    it('preserves existing installations only after explicit adoption, without rewriting settings', async () => {
        const account = Object.assign(new Account(), { id: 'old-account', name: 'Existing', type: 'COMMERCIAL', defaultAddressId: 'old-address' });
        const admin = Object.assign(new AdminSettings(), { billingAccountId: account.id, billingDays: [4, 19], sellerPaysPaymentServiceFee: true });
        bucket(Account).push(account);
        bucket(Address).push(Object.assign(new Address(), { id: 'old-address' }));
        bucket(AdminSettings).push(admin);
        expect((await service.status()).legacyAvailable).toBe(true);
        const result = await service.keepExisting(user);
        expect(result.status).toBe('COMPLETED');
        expect(bucket(AdminSettings)[0]).toBe(admin);
        expect(admin.billingDays).toEqual([4, 19]);
        expect(bucket(AppComission)).toEqual([]);
        expect(groups.insert).not.toHaveBeenCalled();
    });

    it('does not regard an auto-created empty admin settings row as an installation', async () => {
        bucket(AdminSettings).push(new AdminSettings());
        expect((await service.status()).legacyAvailable).toBe(false);
        await expect(service.keepExisting(user)).rejects.toThrow('No unambiguous');
        expect((await service.status()).status).toBe('IN_PROGRESS');
    });

    it('reuses matching commission/report sources without changing custom report names', async () => {
        await platform();
        await service.configure(config({ commissionPercent: 12.34 }), user);
        bucket(AppComission).push(Object.assign(new AppComission(), { percent: Math.fround(12.34), itemClass: '' }));
        bucket(ReportQuery).push(Object.assign(new ReportQuery(), {
            ownerAccountId: savedState().platformAccountId, currency: 'TRY', dateGrouping: 'DAILY', reportType: 'PLATFORM', name: 'Custom source',
        }));
        await service.complete(user);
        expect(bucket(ReportQuery)).toHaveLength(6);
        expect(bucket(ReportQuery)[0]).toHaveProperty('name', 'Custom source');
        expect(bucket(AppComission)).toHaveLength(1);
    });

    it.each([
        { billingDays: [4, 19] }, { comissionItemTaxId: 'existing-tax' }, { billingAccountId: 'existing-account' },
    ])('does not overwrite pre-existing admin configuration %j', async existing => {
        await platform();
        await service.configure(config(), user);
        bucket(AdminSettings).push(Object.assign(new AdminSettings(), existing));
        await expect(service.complete(user)).rejects.toThrow(/existing/i);
        expect((await service.status()).status).toBe('IN_PROGRESS');
        expect(bucket(AdminSettings)[0]).toMatchObject(existing);
    });

    it('prevents fresh setup from replacing an existing installation', async () => {
        bucket(AdminSettings).push(Object.assign(new AdminSettings(), { billingAccountId: 'old' }));
        await expect(service.team('Another platform', user)).rejects.toThrow('existing installation');
        expect(groups.insert).not.toHaveBeenCalled();
        expect(bucket(PlatformSetup)).toEqual([]);
    });

    it('does not overwrite conflicting commissions or complete when team ownership was revoked', async () => {
        await platform();
        await service.configure(config(), user);
        groups.checkUserCapability.mockReturnValueOnce(of(false));
        await expect(service.complete(user)).rejects.toThrow('team ownership');
        bucket(AppComission).push(Object.assign(new AppComission(), { percent: 99, itemClass: '' }));
        await expect(service.complete(user)).rejects.toThrow('conflicts');
        expect((await service.status()).status).toBe('IN_PROGRESS');
        expect(bucket(AdminSettings)).toEqual([]);
    });

    it.each([
        { billingDays: [0] }, { billingDays: [29] }, { billingDays: [1.5] }, { billingDays: [] },
        { commissionPercent: -1 }, { commissionPercent: 101 }, { commissionPercent: NaN },
        { taxRate: 20.5 }, { taxRate: -1 }, { taxRate: 101 },
        { currency: 'JPY' }, { dateGroupings: ['MONTHLY'] }, { alsoSells: 'true' }, { mode: 'UNKNOWN' },
    ])('rejects invalid configuration %j', async invalid => {
        await expect(service.configure(Object.assign(config(), invalid), user)).rejects.toThrow(BadRequestException);
    });

    it('declares administrator roles on every handler, not only on the controller', () => {
        const reflector = new Reflector();
        for (const method of ['status', 'team', 'platform', 'settings', 'seller', 'complete', 'keepExisting'] as const) {
            expect(reflector.get(Roles, PlatformSetupController.prototype[method])).toEqual(['ADMIN', 'POSTRAL-ADMIN', 'POSTRAL_ADMIN']);
        }
    });
});
