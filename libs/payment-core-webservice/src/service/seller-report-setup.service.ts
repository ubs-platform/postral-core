import { BadRequestException, ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';
import {
    SELLER_REPORT_SETUP_CURRENCIES,
    SELLER_REPORT_SETUP_GROUPINGS,
    SellerReportSetupDTO,
    SellerReportSetupGrouping,
    SellerReportSetupResultDTO,
} from '@tk-postral/payment-common';
import { Account, ReportQuery } from '@tk-postral/postral-entities';
import { Capability, UserAuthBackendDTO } from '@ubs-platform/users-common';
import { DataSource, EntityManager } from 'typeorm';
import { AuthUtilService } from './auth-util.service';
import { ReportQueryMapper } from '../mapper/report-query.mapper';

@Injectable()
export class SellerReportSetupService {
    constructor(
        private readonly dataSource: DataSource,
        private readonly auth: AuthUtilService,
        private readonly mapper: ReportQueryMapper,
    ) {}

    async preview(accountId: string, currency: string, user: UserAuthBackendDTO): Promise<SellerReportSetupResultDTO> {
        this.validateCurrency(currency);
        await this.authorize(accountId, user, false);
        await this.findAccount(this.dataSource.manager, accountId, false, true);
        const existing = await this.findSellerQueries(this.dataSource.manager, accountId, currency);
        return this.result(accountId, currency, existing, []);
    }

    async setup(accountId: string, input: SellerReportSetupDTO, user: UserAuthBackendDTO): Promise<SellerReportSetupResultDTO> {
        this.validateCurrency(input?.currency);
        if (!Array.isArray(input?.dateGroupings) || !input.dateGroupings.length ||
            input.dateGroupings.some(grouping => !SELLER_REPORT_SETUP_GROUPINGS.includes(grouping)) ||
            !input.dateGroupings.includes('DAILY')) {
            throw new BadRequestException('Choose valid report groupings including DAILY');
        }
        await this.authorize(accountId, user, true);
        return this.dataSource.transaction(async manager => {
            const { existing, created } = await this.ensureSellerQueries(manager, accountId, input.currency, input.dateGroupings);
            return this.result(accountId, input.currency, existing, created);
        });
    }

    async ensureSellerQueries(
        manager: EntityManager, accountId: string, currency: string, groupings: SellerReportSetupGrouping[],
    ): Promise<{ existing: ReportQuery[]; created: ReportQuery[] }> {
        const account = await this.findAccount(manager, accountId, true, true);
        const existing = await this.findSellerQueries(manager, accountId, currency);
        const created: ReportQuery[] = [];
        for (const grouping of new Set(groupings)) {
            if (!existing.some(query => query.dateGrouping === grouping)) {
                created.push(await this.createQuery(manager, account, currency, grouping, 'SELLER'));
            }
        }
        return { existing, created };
    }

    async ensureDailyQueries(accountId: string, currency: string): Promise<ReportQuery[]> {
        return this.dataSource.transaction(async manager => {
            // Both payment automation and explicit setup lock the same account before checking queries.
            const account = await this.findAccount(manager, accountId, true, false);
            const queries = await manager.find(ReportQuery, {
                where: [
                    { ownerAccountId: accountId, currency, reportType: 'SELLER' },
                    { ownerAccountId: accountId, currency, reportType: 'PLATFORM_SELLER' },
                ],
            });
            for (const type of ['SELLER', 'PLATFORM_SELLER'] as const) {
                if (!queries.some(query => query.dateGrouping === 'DAILY' && query.reportType === type)) {
                    queries.push(await this.createQuery(manager, account, currency, 'DAILY', type));
                }
            }
            return queries;
        });
    }

    private validateCurrency(currency: string): void {
        if (!SELLER_REPORT_SETUP_CURRENCIES.some(value => value === currency)) {
            throw new BadRequestException('Unsupported report currency');
        }
    }

    private async authorize(accountId: string, user: UserAuthBackendDTO, edit: boolean): Promise<void> {
        if (typeof accountId !== 'string' || !accountId.trim()) {
            throw new BadRequestException('Account ID is required');
        }
        const ids = await this.auth.fetchUserAccountIds(user.id, edit
            ? [[Capability.OWNER], [Capability.EDIT]]
            : [[Capability.OWNER], [Capability.EDIT], [Capability.VIEW]]);
        if (!ids.includes(accountId)) {
            throw new ForbiddenException('You cannot configure reports for this account');
        }
    }

    private async findAccount(manager: EntityManager, id: string, lock: boolean, eligible: boolean): Promise<Account> {
        const account = await manager.findOne(Account, {
            where: { id },
            select: ['id', 'name', 'type', 'isExternal', 'deactivated'],
            ...(lock ? { lock: { mode: 'pessimistic_write' as const } } : {}),
        });
        if (!account) throw new NotFoundException('Account not found');
        if (eligible && (account.type !== 'COMMERCIAL' || account.isExternal || account.deactivated)) {
            throw new BadRequestException('Report setup requires an active, non-external commercial account');
        }
        return account;
    }

    private findSellerQueries(manager: EntityManager, accountId: string, currency: string): Promise<ReportQuery[]> {
        return manager.find(ReportQuery, {
            where: { ownerAccountId: accountId, currency, reportType: 'SELLER' },
            order: { name: 'ASC', id: 'ASC' },
        });
    }

    private createQuery(
        manager: EntityManager, account: Account, currency: string,
        dateGrouping: SellerReportSetupGrouping, reportType: 'SELLER' | 'PLATFORM_SELLER',
    ): Promise<ReportQuery> {
        return manager.save(ReportQuery, manager.create(ReportQuery, {
            ownerAccountId: account.id, currency, dateGrouping, reportType,
            name: `${reportType === 'SELLER' ? 'Seller' : 'Platform Seller'} Report / ${account.name.slice(0, 100)} / ${currency} / ${dateGrouping}`,
            description: reportType === 'SELLER'
                ? 'Sales performance for this seller, grouped by the selected calendar period.'
                : 'Daily platform commission and payment service fees for this seller.',
        }));
    }

    private result(accountId: string, currency: string, existing: ReportQuery[], created: ReportQuery[]): SellerReportSetupResultDTO {
        return {
            accountId, currency,
            existing: existing.map(query => this.mapper.toDto(query)),
            created: created.map(query => this.mapper.toDto(query)),
            missing: SELLER_REPORT_SETUP_GROUPINGS.filter(grouping =>
                ![...existing, ...created].some(query => query.dateGrouping === grouping)),
        };
    }
}
