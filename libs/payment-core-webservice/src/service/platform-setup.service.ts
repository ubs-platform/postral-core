import { BadRequestException, ConflictException, ForbiddenException, Injectable, Logger } from '@nestjs/common';
import { randomUUID } from 'node:crypto';
import { DataSource, EntityManager, IsNull, QueryFailedError } from 'typeorm';
import {
    AccountDTO, AccountAddressDto, PlatformSetupAccountDTO, PlatformSetupCompleteDTO, PlatformSetupSettingsDTO,
    PlatformSetupStatusDTO, PlatformSetupStep, SELLER_REPORT_SETUP_CURRENCIES, SELLER_REPORT_SETUP_GROUPINGS,
} from '@tk-postral/payment-common';
import { Account, Address, AdminSettings, AppComission, ItemTaxEntity, PaymentChannelConfig, PlatformSetup, ReportQuery } from '@tk-postral/postral-entities';
import { EntityOwnershipGroupClientService, EntityOwnershipService } from '@ubs-platform/users-microservice-helper';
import { Capability, UserAuthBackendDTO } from '@ubs-platform/users-common';
import { lastValueFrom, timeout } from 'rxjs';
import { AccountMapper } from '../mapper/account.mapper';
import { AddressMapper } from '../mapper/address.mapper';
import { ItemTaxMapper } from '../mapper/item-tax.mapper';
import { PostralConstants } from '../util/consts';
import { SellerReportSetupService } from './seller-report-setup.service';

@Injectable()
export class PlatformSetupService {
    private readonly logger = new Logger(PlatformSetupService.name);

    constructor(
        private readonly db: DataSource,
        private readonly groups: EntityOwnershipGroupClientService,
        private readonly ownership: EntityOwnershipService,
        private readonly accounts: AccountMapper,
        private readonly addresses: AddressMapper,
        private readonly taxes: ItemTaxMapper,
        private readonly sellerReports: SellerReportSetupService,
    ) {}

    async status(): Promise<PlatformSetupStatusDTO> {
        const state = await this.db.manager.findOneBy(PlatformSetup, { id: 'platform' });
        const settings = await this.db.manager.findOne(AdminSettings, { where: {} });
        return {
            status: state?.status ?? 'NOT_STARTED',
            step: state ? this.step(state) : 'TEAM',
            version: state?.version ?? 1,
            startedByUserId: state?.startedByUserId,
            teamId: state?.teamId,
            teamName: state?.teamName,
            platformAccountId: state?.platformSaved ? state.platformAccountId : undefined,
            platformAccountName: state?.platformAccountName,
            sellerAccountId: state?.sellerSaved ? state.sellerAccountId : undefined,
            sellerAccountName: state?.sellerAccountName,
            settings: state?.settings,
            completedAt: state?.completedAt,
            legacyAvailable: (!state || (!state.teamName && !state.platformSaved && state.status !== 'COMPLETED')) && !!settings?.billingAccountId,
        };
    }

    async team(name: string, user: UserAuthBackendDTO): Promise<PlatformSetupStatusDTO> {
        this.requiredText(name, 'Team name', 150);
        if ((await this.status()).legacyAvailable) {
            throw new ConflictException('Keep the existing installation instead of creating another platform');
        }
        await this.initialize(user);
        return this.run(user, async token => {
            let state = await this.edit(token, manager => this.lock(manager, token));
            if (state.teamId) return;
            if (state.teamName && state.teamName !== name.trim()) {
                throw new ConflictException('Resume team creation with the original name');
            }
            state = await this.edit(token, async manager => {
                const current = await this.lock(manager, token);
                current.teamName = name.trim();
                return manager.save(current);
            });
            const group = await lastValueFrom(this.groups.insert({
                name: state.teamName!,
                description: 'Postral platform administration',
                creationKey: state.teamCreationKey,
                initialUserId: state.startedByUserId,
                initialUserEntityCapabilities: ['ACCOUNT', 'ADDRESS', 'TAX'].map(entityName => ({
                    entityGroup: PostralConstants.ENTITY_GROUP_POSTRAL, entityName, capabilities: [Capability.OWNER],
                })),
            }).pipe(timeout(30000)));
            if (!group.id) throw new Error('Team creation returned no ID');
            await this.edit(token, async manager => {
                const current = await this.lock(manager, token);
                current.teamId = group.id;
                await manager.save(current);
            });
        });
    }

    async saveAccount(input: PlatformSetupAccountDTO, seller: boolean, user: UserAuthBackendDTO): Promise<PlatformSetupStatusDTO> {
        return this.run(user, async token => {
            let state = await this.edit(token, async manager => {
                const current = await this.lock(manager, token);
                const saved = seller ? current.sellerSaved : current.platformSaved;
                if (!current.teamId || (seller && (!current.settings?.alsoSells || current.settings.mode !== 'MARKETPLACE'))) {
                    throw new ConflictException('Complete the preceding setup steps');
                }
                if (saved) return current;
                if (seller && !current.platformOwnershipReady) throw new ConflictException('Platform account is not ready');
                this.validateAccount(input?.account);
                const usePlatformAddress = seller && input.usePlatformAddress === true;
                if (!usePlatformAddress) this.validateAddress(input?.address);
                const addressId = usePlatformAddress ? current.addressId : seller ? current.sellerAddressId : current.addressId;
                if (!usePlatformAddress) {
                    const address = await this.addresses.updateEntity(Object.assign(new Address(), { id: addressId }), {
                        ...input.address!, externalPlatformId: undefined, externalPlatformAddressId: undefined,
                    });
                    await manager.save(address);
                }
                const accountInput = this.accountInput(input.account, addressId);
                const account = await this.accounts.updateEntity(
                    Object.assign(new Account(), { id: seller ? current.sellerAccountId : current.platformAccountId }), accountInput,
                );
                await manager.save(account);
                if (seller) {
                    current.sellerSaved = true;
                    current.sellerAccountName = account.name;
                    current.sellerAddressId = addressId;
                } else {
                    current.platformSaved = true;
                    current.platformAccountName = account.name;
                }
                return manager.save(current);
            });
            if (seller ? state.sellerOwnershipReady : state.platformOwnershipReady) return;
            const addressId = seller ? state.sellerAddressId : state.addressId;
            const accountId = seller ? state.sellerAccountId : state.platformAccountId;
            await this.attachOwnership('ADDRESS', addressId, state);
            await this.attachOwnership('ACCOUNT', accountId, state);
            await this.edit(token, async manager => {
                state = await this.lock(manager, token);
                if (seller) state.sellerOwnershipReady = true;
                else state.platformOwnershipReady = true;
                await manager.save(state);
            });
        });
    }

    async configure(input: PlatformSetupSettingsDTO, user: UserAuthBackendDTO): Promise<PlatformSetupStatusDTO> {
        this.validateSettings(input);
        return this.run(user, async token => {
            const state = await this.edit(token, async manager => {
                const current = await this.lock(manager, token);
                if (!current.platformOwnershipReady) throw new ConflictException('Complete the platform account first');
                if (current.settings) {
                    if (JSON.stringify(current.settings) !== JSON.stringify(this.normalizeSettings(input))) {
                        throw new ConflictException('Settings were already saved; resume the existing setup');
                    }
                    return current;
                }
                current.settings = this.normalizeSettings(input);
                current.additionalTaxIds = [];
                for (const definition of current.settings.additionalTaxes ?? []) {
                    const id = randomUUID();
                    current.additionalTaxIds.push(id);
                    await manager.save(this.taxes.updateEntity(Object.assign(new ItemTaxEntity(), { id }), {
                        id, taxName: definition.taxName, isPublic: false,
                        variations: [{ taxMode: 'DEFAULT', taxRate: definition.taxRate }],
                    }));
                }
                if (current.settings.mode === 'MARKETPLACE') {
                    const tax = this.taxes.updateEntity(Object.assign(new ItemTaxEntity(), { id: current.taxId }), {
                        id: current.taxId, taxName: 'Platform commission tax', isPublic: false,
                        variations: [{ taxMode: 'DEFAULT', taxRate: current.settings.taxRate }],
                    });
                    await manager.save(tax);
                }
                return manager.save(current);
            });
            if (state.settings?.mode === 'MARKETPLACE') await this.attachOwnership('TAX', state.taxId, state);
            for (const id of state.additionalTaxIds ?? []) await this.attachOwnership('TAX', id, state);
        });
    }

    async complete(user: UserAuthBackendDTO, input: PlatformSetupCompleteDTO = {}): Promise<PlatformSetupStatusDTO> {
        if (!input || typeof input !== 'object' || Array.isArray(input)) {
            throw new BadRequestException('Invalid setup completion input');
        }
        const channelIds = input.paymentChannelIds === undefined ? [] : input.paymentChannelIds;
        if (!Array.isArray(channelIds) || channelIds.some(id => id !== 'dummy-ecommerce')) {
            throw new BadRequestException('Unsupported setup payment channel');
        }
        return this.run(user, async token => {
            const state = await this.edit(token, manager => this.lock(manager, token));
            if (this.step(state) !== 'REVIEW') throw new ConflictException('Complete all setup steps before finishing');
            await this.verifyOwnership(state, user);
            await this.attachOwnership('ADDRESS', state.addressId, state);
            await this.attachOwnership('ACCOUNT', state.platformAccountId, state);
            if (state.settings!.alsoSells) {
                await this.attachOwnership('ADDRESS', state.sellerAddressId, state);
                await this.attachOwnership('ACCOUNT', state.sellerAccountId, state);
            }
            if (state.settings!.mode === 'MARKETPLACE') await this.attachOwnership('TAX', state.taxId, state);
            for (const id of state.additionalTaxIds ?? []) await this.attachOwnership('TAX', id, state);
            await this.edit(token, async manager => {
                const current = await this.lock(manager, token);
                const config = current.settings!;
                const additionalTaxes = config.additionalTaxes ?? [];
                if ((current.additionalTaxIds?.length ?? 0) !== additionalTaxes.length) {
                    throw new ConflictException('Additional tax recovery IDs are missing');
                }
                for (const [index, definition] of additionalTaxes.entries()) {
                    const tax = await manager.findOne(ItemTaxEntity, {
                        where: { id: current.additionalTaxIds![index] }, relations: ['variations'],
                    });
                    if (!tax || tax.taxName !== definition.taxName || tax.isPublic || tax.variations.length !== 1 ||
                        tax.variations[0].taxMode !== 'DEFAULT' || tax.variations[0].taxRate !== definition.taxRate) {
                        throw new ConflictException('An additional tax is missing or changed');
                    }
                }
                const platform = await this.validAccount(manager, current.platformAccountId, current.addressId);
                const seller = config.mode === 'SELF' ? platform : config.alsoSells
                    ? await this.validAccount(manager, current.sellerAccountId, current.sellerAddressId) : undefined;
                const allSettings = await manager.find(AdminSettings);
                if (allSettings.length > 1) throw new ConflictException('Multiple admin settings records require administrator reconciliation');
                const admin = allSettings[0] ?? new AdminSettings();
                if (admin.billingAccountId && admin.billingAccountId !== platform.id) {
                    throw new ConflictException('An existing billing account must not be overwritten by first-run setup');
                }
                const billingDays = config.mode === 'MARKETPLACE' ? config.billingDays : [];
                if (admin.billingDays?.length && JSON.stringify([...admin.billingDays].sort((a, b) => a - b)) !== JSON.stringify(billingDays)) {
                    throw new ConflictException('Existing billing days conflict with setup; they were not overwritten');
                }
                if (config.mode === 'MARKETPLACE' && admin.comissionItemTaxId && admin.comissionItemTaxId !== current.taxId) {
                    throw new ConflictException('An existing commission tax must not be overwritten by first-run setup');
                }
                await this.ensureCommission(manager, undefined, config.mode === 'SELF' ? 0 : config.commissionPercent);
                if (seller) await this.ensureCommission(manager, seller.id, 0);
                admin.billingAccountId = platform.id;
                admin.billingDays = billingDays;
                if (config.mode === 'MARKETPLACE') {
                    const tax = await manager.findOne(ItemTaxEntity, { where: { id: current.taxId }, relations: ['variations'] });
                    if (!tax || tax.variations.length !== 1 || tax.variations[0].taxRate !== config.taxRate) {
                        throw new ConflictException('Commission tax is missing or changed');
                    }
                    admin.comissionItemTaxId = tax.id;
                    for (const type of ['PLATFORM', 'PLATFORM_FLOW'] as const) {
                        for (const grouping of config.dateGroupings) {
                            const existing = await manager.findOneBy(ReportQuery, { reportType: type, currency: config.currency, dateGrouping: grouping });
                            if (!existing) {
                                await manager.save(ReportQuery, manager.create(ReportQuery, {
                                    ownerAccountId: platform.id, reportType: type, currency: config.currency, dateGrouping: grouping,
                                    name: `${type} / ${config.currency} / ${grouping}`,
                                }));
                            } else if (!existing.ownerAccountId) {
                                throw new ConflictException('Existing platform report source has no account; reconcile it before setup');
                            }
                        }
                    }
                }
                if (seller && config.sellerReports) {
                    await this.sellerReports.ensureSellerQueries(manager, seller.id, config.currency, config.dateGroupings);
                }
                for (const channelId of new Set(channelIds)) {
                    const existing = await manager.findOneBy(PaymentChannelConfig, { channelId });
                    if (!existing) {
                        await manager.save(PaymentChannelConfig, manager.create(PaymentChannelConfig, {
                            channelId, name: 'Dummy E-commerce', enabled: true, devOnly: false,
                            description: 'Test payments only. Before production, set devOnly=true or disable this channel.',
                        }));
                    }
                }
                await manager.save(admin);
                current.status = 'COMPLETED';
                current.completedAt = new Date();
                await manager.save(current);
            });
        });
    }

    async keepExisting(user: UserAuthBackendDTO): Promise<PlatformSetupStatusDTO> {
        await this.initialize(user);
        return this.run(user, async token => {
            await this.edit(token, async manager => {
                const state = await this.lock(manager, token);
                if (state.teamName || state.teamId || state.platformSaved) throw new ConflictException('New setup already started');
                const settings = await manager.find(AdminSettings);
                if (settings.length !== 1 || !settings[0].billingAccountId) throw new ConflictException('No unambiguous existing platform configuration');
                const account = await this.validAccount(manager, settings[0].billingAccountId);
                state.platformAccountId = account.id;
                state.platformAccountName = account.name;
                state.platformSaved = true;
                state.status = 'COMPLETED';
                state.completedAt = new Date();
                await manager.save(state);
            });
        });
    }

    private step(state: PlatformSetup): PlatformSetupStep {
        if (state.status === 'COMPLETED') return 'COMPLETED';
        if (!state.teamId) return 'TEAM';
        if (!state.platformOwnershipReady) return 'PLATFORM';
        if (!state.settings) return 'SETTINGS';
        if (state.settings.mode === 'MARKETPLACE' && state.settings.alsoSells && !state.sellerOwnershipReady) return 'SELLER';
        return 'REVIEW';
    }

    private async initialize(user: UserAuthBackendDTO): Promise<void> {
        if (await this.db.manager.findOneBy(PlatformSetup, { id: 'platform' })) return;
        const state = Object.assign(new PlatformSetup(), {
            startedByUserId: user.id, teamCreationKey: randomUUID(), addressId: randomUUID(),
            platformAccountId: randomUUID(), sellerAddressId: randomUUID(), sellerAccountId: randomUUID(), taxId: randomUUID(),
        });
        try {
            await this.db.manager.insert(PlatformSetup, state);
        } catch (error: unknown) {
            if (!(error instanceof QueryFailedError) || error.driverError?.code !== 'ER_DUP_ENTRY') throw error;
        }
    }

    private async run(user: UserAuthBackendDTO, action: (token: string) => Promise<void>): Promise<PlatformSetupStatusDTO> {
        const token = randomUUID();
        const completed = await this.db.transaction(async manager => {
            const state = await manager.findOne(PlatformSetup, { where: { id: 'platform' }, lock: { mode: 'pessimistic_write' } });
            if (!state) throw new ConflictException('Start setup with the team step');
            if (state.status === 'COMPLETED') return true;
            if (state.startedByUserId !== user.id) throw new ForbiddenException('Setup must be resumed by the administrator who started it');
            if (state.leaseUntil && state.leaseUntil.getTime() > Date.now()) throw new ConflictException('Another setup operation is running; retry shortly');
            state.leaseToken = token;
            state.leaseUntil = new Date(Date.now() + 5 * 60 * 1000);
            await manager.save(state);
            return false;
        });
        if (completed) return this.status();
        try {
            await action(token);
        } catch (error: unknown) {
            this.logger.error('Platform setup step failed', error instanceof Error ? error.stack : String(error));
            throw error;
        } finally {
            await this.db.manager.update(PlatformSetup, { id: 'platform', leaseToken: token }, { leaseUntil: null });
        }
        return this.status();
    }

    private edit<T>(_token: string, action: (manager: EntityManager) => Promise<T>): Promise<T> {
        return this.db.transaction(action);
    }

    private async lock(manager: EntityManager, token: string): Promise<PlatformSetup> {
        const state = await manager.findOne(PlatformSetup, { where: { id: 'platform' }, lock: { mode: 'pessimistic_write' } });
        if (!state || state.leaseToken !== token || !state.leaseUntil || state.leaseUntil.getTime() <= Date.now()) {
            throw new ConflictException('Setup operation expired; retry the step');
        }
        return state;
    }

    private async attachOwnership(entityName: string, id: string, state: PlatformSetup): Promise<void> {
        if (!state.teamId) throw new ConflictException('Platform team is missing');
        const acknowledged = await lastValueFrom(this.ownership.ensureTeamOwnership({
            entityGroup: PostralConstants.ENTITY_GROUP_POSTRAL, entityName, entityId: id,
            entityOwnershipGroupId: state.teamId, userCapabilities: [], overriderRoles: ['ADMIN'],
        }).pipe(timeout(30000)));
        if (acknowledged !== true) throw new Error('Team ownership was not acknowledged');
    }

    private async verifyOwnership(state: PlatformSetup, user: UserAuthBackendDTO): Promise<void> {
        const permitted = await lastValueFrom(this.groups.checkUserCapability({
            entityOwnershipGroupId: state.teamId!, userId: user.id, requestedCapabilities: [[Capability.OWNER]],
        }).pipe(timeout(30000)));
        if (!permitted) throw new ForbiddenException('Platform team ownership is required');
    }

    private async validAccount(manager: EntityManager, id: string, expectedAddressId?: string): Promise<Account> {
        const account = await manager.findOneBy(Account, { id });
        if (!account || account.type !== 'COMMERCIAL' || account.isExternal || account.deactivated || !account.defaultAddressId ||
            !await manager.existsBy(Address, { id: account.defaultAddressId })) {
            throw new ConflictException('An active commercial account with an address is required');
        }
        if (expectedAddressId && account.defaultAddressId !== expectedAddressId) {
            throw new ConflictException('The setup account address has changed; administrator reconciliation is required');
        }
        return account;
    }

    private async ensureCommission(manager: EntityManager, sellerAccountId: string | undefined, percent: number): Promise<void> {
        const definitions = await manager.find(AppComission, {
            where: { sellerAccountId: sellerAccountId ?? IsNull(), externalPlatformId: IsNull(), itemClass: '' },
        });
        if (definitions.some(definition => Math.fround(definition.percent) !== Math.fround(percent)) || definitions.length > 1) {
            throw new ConflictException('An existing commission definition conflicts with setup; it was not overwritten');
        }
        if (!definitions.length) await manager.save(AppComission, manager.create(AppComission, {
            sellerAccountId, itemClass: '', percent, bias: sellerAccountId ? 3 : 1,
        }));
    }

    private normalizeSettings(input: PlatformSetupSettingsDTO): PlatformSetupSettingsDTO {
        return {
            mode: input.mode, currency: input.currency,
            commissionPercent: input.mode === 'SELF' ? 0 : input.commissionPercent,
            taxRate: input.mode === 'SELF' ? 0 : input.taxRate,
            billingDays: input.mode === 'SELF' ? [] : [...new Set(input.billingDays)].sort((a, b) => a - b),
            alsoSells: input.mode === 'MARKETPLACE' && input.alsoSells,
            sellerReports: input.sellerReports && (input.mode === 'SELF' || input.alsoSells),
            dateGroupings: SELLER_REPORT_SETUP_GROUPINGS.filter(grouping => input.dateGroupings.includes(grouping)),
            ...(input.additionalTaxes !== undefined ? {
                additionalTaxes: input.additionalTaxes.map(tax => ({ taxName: tax.taxName.trim(), taxRate: tax.taxRate })),
            } : {}),
        };
    }

    private validateSettings(input: PlatformSetupSettingsDTO): void {
        if (!input || !['SELF', 'MARKETPLACE'].includes(input.mode) ||
            !SELLER_REPORT_SETUP_CURRENCIES.some(currency => currency === input.currency) ||
            typeof input.alsoSells !== 'boolean' || typeof input.sellerReports !== 'boolean' ||
            !Array.isArray(input.dateGroupings) || !input.dateGroupings.includes('DAILY') ||
            input.dateGroupings.some(grouping => !SELLER_REPORT_SETUP_GROUPINGS.includes(grouping))) {
            throw new BadRequestException('Invalid setup settings');
        }
        if (input.mode === 'MARKETPLACE' && (
            !Number.isFinite(input.commissionPercent) || input.commissionPercent < 0 || input.commissionPercent > 100 ||
            !Number.isInteger(input.taxRate) || input.taxRate < 0 || input.taxRate > 100 ||
            !Array.isArray(input.billingDays) || !input.billingDays.length ||
            input.billingDays.some(day => !Number.isInteger(day) || day < 1 || day > 28)
        )) throw new BadRequestException('Commission/tax must be 0-100 and billing days 1-28');
        if (input.additionalTaxes !== undefined) {
            if (!Array.isArray(input.additionalTaxes) || input.additionalTaxes.length > 50) {
                throw new BadRequestException('Choose at most 50 additional taxes');
            }
            const names = new Set<string>();
            for (const tax of input.additionalTaxes) {
                if (!tax || typeof tax !== 'object') throw new BadRequestException('Invalid additional tax');
                this.requiredText(tax.taxName, 'Tax name', 150);
                if (!Number.isInteger(tax.taxRate) || tax.taxRate < 0 || tax.taxRate > 100) {
                    throw new BadRequestException('Additional tax rate must be a whole percentage from 0 to 100');
                }
                const name = tax.taxName.trim().toLowerCase();
                if (names.has(name)) throw new BadRequestException('Additional tax names must be unique');
                names.add(name);
            }
        }
    }

    private requiredText(value: unknown, label: string, max = 255): void {
        if (typeof value !== 'string' || !value.trim() || value.length > max) throw new BadRequestException(`${label} is required (maximum ${max} characters)`);
    }

    private validateAccount(account: AccountDTO): void {
        if (!account) throw new BadRequestException('Account is required');
        this.requiredText(account.name, 'Account name', 150);
        this.requiredText(account.legalIdentity, 'Legal identity', 100);
        for (const key of ['taxOffice', 'phone', 'emailAddress', 'website'] as const) {
            if (account[key] != null && typeof account[key] !== 'string') throw new BadRequestException(`Invalid account ${key}`);
        }
        if (account.bankAccounts !== undefined && (!Array.isArray(account.bankAccounts) || account.bankAccounts.length > 20 ||
            account.bankAccounts.some(bank => !bank || !SELLER_REPORT_SETUP_CURRENCIES.some(currency => currency === bank.currency) ||
                ['bankName', 'bankIban', 'bankSwift', 'bankBic'].some(key => Reflect.get(bank, key) != null && typeof Reflect.get(bank, key) !== 'string')))) {
            throw new BadRequestException('Invalid bank accounts');
        }
    }

    private validateAddress(address: AccountAddressDto | undefined): void {
        if (!address) throw new BadRequestException('Address is required');
        for (const key of ['name', 'streetName', 'cityName', 'postalZone', 'country'] as const) {
            this.requiredText(address[key], `Address ${key}`);
        }
        if (Object.values(address).some(value => value != null && typeof value !== 'string') || !/^[A-Z]{2}$/.test(address.country)) {
            throw new BadRequestException('Address fields must be text with a two-letter country code');
        }
    }

    private accountInput(input: AccountDTO, addressId: string): AccountDTO {
        return Object.assign(new AccountDTO(), {
            name: input.name.trim(), legalIdentity: input.legalIdentity.trim(), type: 'COMMERCIAL',
            isExternal: false, defaultAddressId: addressId, taxOffice: input.taxOffice,
            phone: input.phone, website: input.website, emailAddress: input.emailAddress,
            bankAccounts: input.bankAccounts?.map(bank => ({
                currency: bank.currency, bankName: bank.bankName, bankIban: bank.bankIban, bankSwift: bank.bankSwift, bankBic: bank.bankBic,
            })),
        });
    }
}
