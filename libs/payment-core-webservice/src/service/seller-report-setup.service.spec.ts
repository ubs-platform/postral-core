import { Test } from '@nestjs/testing';
import { DataSource, FindManyOptions } from 'typeorm';
import { Account, ReportQuery } from '@tk-postral/postral-entities';
import { Capability, UserAuthBackendDTO } from '@ubs-platform/users-common';
import { SellerReportSetupDTO } from '@tk-postral/payment-common';
import { SellerReportSetupService } from './seller-report-setup.service';
import { AuthUtilService } from './auth-util.service';
import { ReportQueryMapper } from '../mapper/report-query.mapper';

describe('SellerReportSetupService', () => {
    let service: SellerReportSetupService;
    let stored: ReportQuery[];
    const manager = {
        findOne: jest.fn(),
        find: jest.fn(),
        create: jest.fn(),
        save: jest.fn(),
    };
    const auth = { fetchUserAccountIds: jest.fn() };
    const transaction = jest.fn();
    const user = Object.assign(new UserAuthBackendDTO(), { id: 'user', roles: [] });
    const input: SellerReportSetupDTO = { currency: 'TRY', dateGroupings: ['DAILY', 'MONTHLY', 'YEARLY'] };

    beforeEach(async () => {
        jest.resetAllMocks();
        stored = [];
        auth.fetchUserAccountIds.mockResolvedValue(['seller']);
        manager.findOne.mockResolvedValue({ id: 'seller', name: 'Seller', type: 'COMMERCIAL', isExternal: false, deactivated: false });
        manager.find.mockImplementation((_target: typeof ReportQuery, options: FindManyOptions<ReportQuery>) => {
            const clauses = Array.isArray(options.where) ? options.where : [options.where];
            return Promise.resolve(stored.filter(query => clauses.some(where =>
                where !== undefined && where.ownerAccountId === query.ownerAccountId && where.currency === query.currency && where.reportType === query.reportType)));
        });
        manager.create.mockImplementation((_target: typeof ReportQuery, data: Partial<ReportQuery>) => Object.assign(new ReportQuery(), data));
        manager.save.mockImplementation((_target: typeof ReportQuery, query: ReportQuery) => {
            query.id = `query-${stored.length}`;
            stored.push(query);
            return Promise.resolve(query);
        });
        // Model transactions serialized by the account row lock; assert the real lock option below.
        let previous = Promise.resolve<unknown>(undefined);
        transaction.mockImplementation((callback: (transactionManager: typeof manager) => Promise<unknown>) => {
            const result = previous.then(() => callback(manager));
            previous = result.catch(() => undefined);
            return result;
        });
        const module = await Test.createTestingModule({
            providers: [
                SellerReportSetupService,
                { provide: DataSource, useValue: { manager, transaction } },
                { provide: AuthUtilService, useValue: auth },
                ReportQueryMapper,
            ],
        }).compile();
        service = module.get(SellerReportSetupService);
    });

    it('creates exactly three seller sources and locks the account before reading sources', async () => {
        const result = await service.setup('seller', input, user);
        expect(result.created.map(query => query.dateGrouping)).toEqual(['DAILY', 'MONTHLY', 'YEARLY']);
        expect(result.created.every(query => query.reportType === 'SELLER' && query.currency === 'TRY')).toBe(true);
        expect(result.missing).toEqual([]);
        expect(manager.findOne).toHaveBeenCalledWith(Account, expect.objectContaining({
            where: { id: 'seller' }, lock: { mode: 'pessimistic_write' },
        }));
        expect(manager.findOne.mock.invocationCallOrder[0]).toBeLessThan(manager.find.mock.invocationCallOrder[0]);
        expect(auth.fetchUserAccountIds).toHaveBeenCalledWith('user', [[Capability.OWNER], [Capability.EDIT]]);
    });

    it('only adds missing sources and preserves custom duplicates and other currencies', async () => {
        stored.push(...['custom-1', 'custom-2'].map(id => Object.assign(new ReportQuery(), {
            id, name: id, ownerAccountId: 'seller', currency: 'TRY', dateGrouping: 'DAILY',
        })));
        stored.push(Object.assign(new ReportQuery(), { id: 'usd', ownerAccountId: 'seller', currency: 'USD', dateGrouping: 'MONTHLY' }));
        const result = await service.setup('seller', input, user);
        expect(result.existing.map(query => query.id)).toEqual(['custom-1', 'custom-2']);
        expect(result.created).toHaveLength(2);
        expect(stored[0].name).toBe('custom-1');
        expect(stored).toHaveLength(5);
    });

    it('is repeatable and interoperates with simultaneous payment daily setup', async () => {
        await Promise.all([
            service.setup('seller', input, user),
            service.ensureDailyQueries('seller', 'TRY'),
            service.setup('seller', input, user),
            service.ensureDailyQueries('seller', 'TRY'),
        ]);
        expect(stored.filter(query => query.reportType === 'SELLER')).toHaveLength(3);
        expect(stored.filter(query => query.reportType === 'PLATFORM_SELLER')).toHaveLength(1);
        expect(manager.findOne.mock.calls.every(([, options]) => options.lock?.mode === 'pessimistic_write')).toBe(true);
        expect((await service.setup('seller', input, user)).created).toEqual([]);
    });

    it('previews without writes, includes all existing sources and reports missing periods', async () => {
        await service.setup('seller', { currency: 'TRY', dateGroupings: ['DAILY'] }, user);
        manager.save.mockClear();
        const result = await service.preview('seller', 'TRY', user);
        expect(result.existing).toHaveLength(1);
        expect(result.created).toEqual([]);
        expect(result.missing).toEqual(['MONTHLY', 'YEARLY']);
        expect(manager.save).not.toHaveBeenCalled();
        expect(auth.fetchUserAccountIds).toHaveBeenLastCalledWith('user', [[Capability.OWNER], [Capability.EDIT], [Capability.VIEW]]);
    });

    it.each([
        { currency: 'XYZ', dateGroupings: ['DAILY'] },
        { currency: 'try', dateGroupings: ['DAILY'] },
        { currency: 'TRY', dateGroupings: [] },
        { currency: 'TRY', dateGroupings: ['MONTHLY'] },
        { currency: 'TRY', dateGroupings: ['DAILY', 'WEEKLY'] },
        { currency: 'TRY', dateGroupings: 'DAILY' },
        null,
    ])('rejects invalid setup input %j without starting a transaction', async invalid => {
        await expect(service.setup('seller', invalid as SellerReportSetupDTO, user)).rejects.toThrow();
        expect(transaction).not.toHaveBeenCalled();
    });

    it('rejects an unowned account, including for admins', async () => {
        auth.fetchUserAccountIds.mockResolvedValue([]);
        await expect(service.setup('seller', input, { ...user, roles: ['ADMIN'] })).rejects.toThrow('cannot configure');
        expect(transaction).not.toHaveBeenCalled();
    });

    it.each([
        { type: 'INDIVIDUAL' }, { isExternal: true }, { deactivated: true },
    ])('rejects ineligible accounts %j', async overrides => {
        manager.findOne.mockResolvedValue({ type: 'COMMERCIAL', ...overrides });
        await expect(service.setup('seller', input, user)).rejects.toThrow('active, non-external');
        expect(manager.save).not.toHaveBeenCalled();
    });

    it('surfaces missing accounts and persistence errors', async () => {
        manager.findOne.mockResolvedValueOnce(null);
        await expect(service.setup('seller', input, user)).rejects.toThrow('Account not found');
        manager.save.mockRejectedValueOnce(new Error('database unavailable'));
        await expect(service.setup('seller', input, user)).rejects.toThrow('database unavailable');
    });

    it('payment automation keeps all matching custom sources and supports other payment currencies', async () => {
        stored.push(Object.assign(new ReportQuery(), {
            id: 'custom', ownerAccountId: 'seller', currency: 'JPY', dateGrouping: 'MONTHLY',
        }));
        const result = await service.ensureDailyQueries('seller', 'JPY');
        expect(result.map(query => [query.reportType, query.dateGrouping])).toEqual([
            ['SELLER', 'MONTHLY'], ['SELLER', 'DAILY'], ['PLATFORM_SELLER', 'DAILY'],
        ]);
    });
});
