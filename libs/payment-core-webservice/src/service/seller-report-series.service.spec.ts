import { Test } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import {
    Account,
    Report,
    ReportPaymentRelation,
    ReportQuery,
} from '@tk-postral/postral-entities';
import { SellerReportSeriesSearchDTO } from '@tk-postral/payment-common';
import { UserAuthBackendDTO } from '@ubs-platform/users-common';
import { FindManyOptions } from 'typeorm';
import { SellerReportSeriesService } from './seller-report-series.service';
import { AuthUtilService } from './auth-util.service';
import { ReportDigestionService } from './report-digestion.service';
import { ReportMapper } from '../mapper/report-mapper';
import { ReportQueryMapper } from '../mapper/report-query.mapper';

describe('SellerReportSeriesService', () => {
    let service: SellerReportSeriesService;
    const accounts = { findOne: jest.fn() };
    const queries = { find: jest.fn() };
    const reports = {
        find: jest.fn<Promise<Report[]>, [FindManyOptions<Report>]>(),
    };
    const relations = { existsBy: jest.fn() };
    const auth = { fetchUserAccountIds: jest.fn() };
    const user = Object.assign(new UserAuthBackendDTO(), {
        id: 'user',
        roles: ['ADMIN'],
    });
    const filters: SellerReportSeriesSearchDTO = {
        accountId: 'seller',
        currency: 'TRY',
        dateGrouping: 'DAILY',
        reportSize: 7,
    };
    const query = Object.assign(new ReportQuery(), {
        id: 'source',
        name: 'Daily sales',
        ownerAccountId: 'seller',
        currency: 'TRY',
        dateGrouping: 'DAILY',
    });

    beforeEach(async () => {
        jest.resetAllMocks();
        jest.useFakeTimers().setSystemTime(new Date(2026, 0, 3, 14));
        accounts.findOne.mockResolvedValue({ id: 'seller' });
        queries.find.mockResolvedValue([query]);
        reports.find.mockResolvedValue([]);
        relations.existsBy.mockResolvedValue(false);
        auth.fetchUserAccountIds.mockResolvedValue(['seller']);
        const module = await Test.createTestingModule({
            providers: [
                SellerReportSeriesService,
                { provide: getRepositoryToken(Account), useValue: accounts },
                { provide: getRepositoryToken(ReportQuery), useValue: queries },
                { provide: getRepositoryToken(Report), useValue: reports },
                {
                    provide: getRepositoryToken(ReportPaymentRelation),
                    useValue: relations,
                },
                { provide: AuthUtilService, useValue: auth },
                {
                    provide: ReportDigestionService,
                    useValue: {
                        buildPeriodLabel: (
                            grouping: SellerReportSeriesSearchDTO['dateGrouping'],
                            date: Date,
                        ) =>
                            ReportDigestionService.prototype.buildPeriodLabel(
                                grouping,
                                date,
                            ),
                    },
                },
                {
                    provide: ReportMapper,
                    useValue: { toDto: (report: Report) => report },
                },
                {
                    provide: ReportQueryMapper,
                    useValue: { toDto: (source: ReportQuery) => source },
                },
            ],
        }).compile();
        service = module.get(SellerReportSeriesService);
    });

    afterEach(() => jest.useRealTimers());

    it('returns exactly seven calendar days including gaps across a year boundary', async () => {
        const report = Object.assign(new Report(), {
            id: 'report',
            periodLabel: '2026-01-02',
            currency: 'TRY',
            totalSaleAmount: 123.45,
        });
        reports.find.mockResolvedValue([report]);
        relations.existsBy
            .mockResolvedValueOnce(true)
            .mockResolvedValueOnce(true);
        const result = await service.fetch(filters, user);
        expect(result.periods.map((period) => period.periodLabel)).toEqual([
            '2025-12-28',
            '2025-12-29',
            '2025-12-30',
            '2025-12-31',
            '2026-01-01',
            '2026-01-02',
            '2026-01-03',
        ]);
        expect(result.periods[0].report).toBeNull();
        expect(result.periods[5].report?.totalSaleAmount).toBe(123.45);
        expect(result.periods[6].isCurrentPeriod).toBe(true);
        expect(
            result.periods.filter((period) => period.isCurrentPeriod),
        ).toHaveLength(1);
        expect(result.hasPendingRecords).toBe(true);
        expect(result.hasFailedRecords).toBe(true);
        expect(reports.find.mock.calls[0][0]).toMatchObject({
            where: {
                queryId: 'source',
                currency: 'TRY',
                archived: false,
                reportType: 'SELLER',
            },
        });
    });

    it.each([
        ['MONTHLY', 3, ['2025-11', '2025-12', '2026-01']],
        ['YEARLY', 4, ['2023', '2024', '2025', '2026']],
    ] as const)(
        'uses exact %s sources without aggregating daily reports',
        async (dateGrouping, reportSize, labels) => {
            const result = await service.fetch(
                { ...filters, dateGrouping, reportSize },
                user,
            );
            expect(result.periods.map((period) => period.periodLabel)).toEqual(
                labels,
            );
            expect(queries.find).toHaveBeenCalledWith(
                expect.objectContaining({
                    where: {
                        ownerAccountId: 'seller',
                        reportType: 'SELLER',
                        dateGrouping,
                        currency: 'TRY',
                    },
                }),
            );
        },
    );

    it('keeps leap day in the daily calendar', async () => {
        jest.setSystemTime(new Date(2024, 2, 2));
        const result = await service.fetch(filters, user);
        expect(result.periods.map((period) => period.periodLabel)).toContain(
            '2024-02-29',
        );
    });

    it('does not invent reports when a grouping has no source', async () => {
        queries.find.mockResolvedValue([]);
        const result = await service.fetch(filters, user);
        expect(result.queries).toEqual([]);
        expect(result.periods).toEqual([]);
        expect(reports.find).not.toHaveBeenCalled();
    });

    it('requires an explicit source when several queries match', async () => {
        queries.find.mockResolvedValue([query, { ...query, id: 'other' }]);
        const result = await service.fetch(filters, user);
        expect(result.queries).toHaveLength(2);
        expect(result.selectedQueryId).toBeUndefined();
        expect(reports.find).not.toHaveBeenCalled();
        await service.fetch({ ...filters, queryId: 'other' }, user);
        expect(reports.find.mock.calls[0][0]).toMatchObject({
            where: { queryId: 'other' },
        });
    });

    it('rejects mismatched query IDs', async () => {
        await expect(
            service.fetch({ ...filters, queryId: 'foreign' }, user),
        ).rejects.toThrow('does not match');
        expect(reports.find).not.toHaveBeenCalled();
    });

    it('does not grant admin users implicit access to another seller', async () => {
        auth.fetchUserAccountIds.mockResolvedValue([]);
        await expect(service.fetch(filters, user)).rejects.toThrow(
            'cannot view reports',
        );
        expect(accounts.findOne).not.toHaveBeenCalled();
        expect(queries.find).not.toHaveBeenCalled();
    });

    it('requires an active internal commercial account', async () => {
        accounts.findOne.mockResolvedValue(null);
        await expect(service.fetch(filters, user)).rejects.toThrow(
            'commercial seller account not found',
        );
        expect(accounts.findOne).toHaveBeenCalledWith({
            where: {
                id: 'seller',
                type: 'COMMERCIAL',
                isExternal: false,
                deactivated: false,
            },
            select: ['id'],
        });
    });

    it.each([
        { skipUnavailableReports: 'yes' },
        { skipUnavailableReports: '' },
        { skipUnavailableReports: 1 },
        { skipUnavailableReports: ['true'] },
        { reportSize: 0 },
        { reportSize: 8 },
        { reportSize: 1.5 },
        { reportSize: 'abc' },
        { dateGrouping: 'ALL' },
        { dateGrouping: '__proto__' },
        { currency: 'try' },
        { accountId: '' },
        { queryId: ['source'] },
        { dateGrouping: ['DAILY'] },
        { reportSize: [7] },
    ])('rejects invalid filters %j before accessing data', async (invalid) => {
        await expect(
            service.fetch(Object.assign({}, filters, invalid), user),
        ).rejects.toThrow('Invalid seller report');
        expect(auth.fetchUserAccountIds).not.toHaveBeenCalled();
    });

    it('accepts the report size string supplied by HTTP query parameters', async () => {
        const input = Object.assign(
            new SellerReportSeriesSearchDTO(),
            filters,
            { reportSize: '7' },
        );
        expect((await service.fetch(input, user)).periods).toHaveLength(7);
    });

    it.each([true, 'true'] as const)(
        'omits only missing periods when skipUnavailableReports is %j',
        async (skipUnavailableReports) => {
            const report = Object.assign(new Report(), {
                id: 'zero-report',
                periodLabel: '2026-01-02',
                totalSaleAmount: 0,
            });
            reports.find.mockResolvedValue([report]);
            const result = await service.fetch(
                { ...filters, skipUnavailableReports },
                user,
            );
            expect(result.periods).toEqual([{
                periodLabel: '2026-01-02',
                isCurrentPeriod: false,
                report,
            }]);
            expect(result.reportSize).toBe(7);
            expect(reports.find).toHaveBeenCalledTimes(1);
        },
    );

    it.each([false, 'false'] as const)(
        'preserves missing periods when skipUnavailableReports is %j',
        async (skipUnavailableReports) => {
            const result = await service.fetch(
                { ...filters, skipUnavailableReports },
                user,
            );
            expect(result.periods).toHaveLength(7);
            expect(result.periods.every((period) => period.report === null)).toBe(true);
        },
    );

    it('returns no periods when skipping and no reports exist', async () => {
        const result = await service.fetch(
            { ...filters, skipUnavailableReports: true },
            user,
        );
        expect(result.periods).toEqual([]);
        expect(relations.existsBy).not.toHaveBeenCalled();
    });
});
