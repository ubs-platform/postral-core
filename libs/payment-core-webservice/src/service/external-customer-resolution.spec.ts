import { Test } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { BadRequestException } from '@nestjs/common';
import { Account, Address } from '@tk-postral/postral-entities';
import { AccountDTO, AccountAddressDto } from '@tk-postral/payment-common';
import { EntityManager } from 'typeorm';
import { EntityOwnershipService } from '@ubs-platform/users-microservice-helper';
import { AccountService } from './account.service';
import { AddressService } from './address.service';
import { AccountMapper } from '../mapper/account.mapper';
import { AddressMapper } from '../mapper/address.mapper';
import { AuthUtilService } from './auth-util.service';

describe('External customer resolution', () => {
    const repo = { findOne: jest.fn(), save: jest.fn(async entity => entity) };
    const ownership = { afterCreate: jest.fn() };
    const addressMapper = {
        updateEntity: jest.fn(async (entity: Address, dto: AccountAddressDto) =>
            Object.assign(entity, dto, { streetName: `encrypted:${dto.streetName}`, room: `encrypted:${dto.room ?? ''}` })),
    };
    let accounts: AccountService;
    let addresses: AddressService;
    let manager: EntityManager;

    beforeEach(async () => {
        jest.clearAllMocks();
        repo.findOne.mockResolvedValue(null);
        const module = await Test.createTestingModule({
            providers: [
                AccountService, AddressService,
                { provide: getRepositoryToken(Account), useValue: repo },
                { provide: getRepositoryToken(Address), useValue: repo },
                { provide: EntityManager, useValue: { getRepository: () => repo } },
                { provide: AccountMapper, useValue: { updateEntity: async (entity: Account, dto: AccountDTO) => Object.assign(entity, dto) } },
                { provide: AddressMapper, useValue: addressMapper },
                { provide: EntityOwnershipService, useValue: {} },
                { provide: AuthUtilService, useValue: ownership },
            ],
        }).compile();
        accounts = module.get(AccountService);
        addresses = module.get(AddressService);
        manager = module.get(EntityManager);
    });

    it('creates real external customers in the caller transaction without seller ownership', async () => {
        const account = await accounts.resolveOrCreateForExternalPlatform(
            { id: '', name: 'Customer', legalIdentity: '123', type: 'INDIVIDUAL' },
            'platform', undefined, manager,
        );
        expect(account.isExternal).toBe(true);
        expect(account.externalPlatformId).toBe('platform');
        expect(repo.save).toHaveBeenCalledWith(expect.objectContaining({ isExternal: true }));
        expect(ownership.afterCreate).not.toHaveBeenCalled();
    });

    it('does not reuse a normal account returned by an external ID lookup', async () => {
        repo.findOne.mockResolvedValue(Object.assign(new Account(), { id: 'normal', isExternal: false }));
        await expect(accounts.resolveOrCreateForExternalPlatform(
            { id: '', name: 'Customer', legalIdentity: '123', type: 'INDIVIDUAL', externalPlatformAccountId: 'external-customer' },
            'platform', undefined, manager,
        )).rejects.toBeInstanceOf(BadRequestException);
        expect(repo.save).not.toHaveBeenCalled();
    });

    it('matches complete encrypted address fields within the platform, including apartment number', async () => {
        await addresses.resolveOrCreateForExternalPlatform(
            { name: 'Home', country: 'TR', cityName: 'City', citySubdivisionName: 'District', postalZone: '34000', streetName: 'Street', room: '42' },
            'platform', undefined, manager,
        );
        expect(repo.findOne).toHaveBeenCalledWith({
            where: expect.objectContaining({
                externalPlatformId: 'platform', streetName: 'encrypted:Street', room: 'encrypted:42',
                country: 'TR', citySubdivisionName: 'District', postalZone: '34000',
            }),
        });
        expect(repo.save).toHaveBeenCalledWith(expect.objectContaining({ externalPlatformId: 'platform' }));
        expect(ownership.afterCreate).not.toHaveBeenCalled();
    });
});
