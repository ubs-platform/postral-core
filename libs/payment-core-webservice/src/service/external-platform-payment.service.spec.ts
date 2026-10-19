import { Test } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { BadRequestException, ConflictException, Logger, UnauthorizedException } from '@nestjs/common';
import { CreateExternalPlatformPaymentDTO, PaymentDTO } from '@tk-postral/payment-common';
import { Account, Address, ExternalPlatform, Payment, InvoiceAddress } from '@tk-postral/postral-entities';
import { UserAuthBackendDTO } from '@ubs-platform/users-common';
import { ExternalPlatformPaymentService } from './external-platform-payment.service';
import { PaymentMapper } from '../mapper/payment.mapper';
import { PaymentTaxMapper } from '../mapper/payment-tax.mapper';
import { InvoiceAddressMapper } from '../mapper/invoice-address.mapper';
import { AccountService } from './account.service';
import { AddressService } from './address.service';
import { AdminSettingsService } from './admin-settings.service';
import { AppComissionService } from './app-commission.service';
import { ExternalPlatformService } from './external-platform.service';
import { PaymentService } from './payment.service';
import { AuthUtilService } from './auth-util.service';

describe('ExternalPlatformPaymentService', () => {
    let service: ExternalPlatformPaymentService;
    const platform = Object.assign(new ExternalPlatform(), { id: 'platform', name: 'Platform', active: true });
    const customer = Object.assign(new Account(), { id: 'customer', isExternal: true });
    const address = Object.assign(new Address(), { id: 'address', streetName: 'encrypted-street' });
    const manager = {
        findOne: jest.fn(),
        save: jest.fn(async (_entity, payment: Payment) => Object.assign(payment, { id: 'payment' })),
    };
    const repo = { manager: { transaction: jest.fn(async callback => callback(manager)) } };
    const accounts = {
        fetchOne: jest.fn(),
        resolveOrCreateForExternalPlatform: jest.fn(),
        updateDefaultAddress: jest.fn(),
        toOutput: jest.fn(),
    };
    const addresses = { resolveOrCreateForExternalPlatform: jest.fn() };
    const payments = {
        applyItemSellerSnapshots: jest.fn(),
        applyAccountSnapshot: jest.fn(),
        onPaymentCompleted: jest.fn(),
        paymentStream: { next: jest.fn() },
    };
    const auth = { checkUserEntityOwnership: jest.fn() };
    const invoiceAddress = { toEntityFromAccountAddress: jest.fn(() => new InvoiceAddress()) };
    const user = Object.assign(new UserAuthBackendDTO(), { id: 'seller-user', roles: [] });
    const input = (): CreateExternalPlatformPaymentDTO => ({
        externalPlatformId: 'platform',
        externalPlatformOrderId: ' order-1 ',
        currency: 'TRY',
        customerAccount: { id: '', name: 'Customer', legalIdentity: '123', type: 'INDIVIDUAL' },
        billingAddress: { name: 'Home', streetName: 'Street', cityName: 'City', citySubdivisionName: 'District', postalZone: '34000', country: 'TR' },
        items: [{ name: 'Item', sellerAccountId: 'seller', quantity: 2, unitAmount: 120, taxRate: 20 }],
    });

    beforeEach(async () => {
        jest.clearAllMocks();
        manager.findOne.mockImplementation(async entity => entity === ExternalPlatform ? platform : null);
        platform.active = true;
        accounts.fetchOne.mockResolvedValue({ id: 'seller', type: 'COMMERCIAL', defaultAddressId: 'seller-address' });
        accounts.resolveOrCreateForExternalPlatform.mockResolvedValue(customer);
        accounts.toOutput.mockResolvedValue({ id: 'customer', name: 'Plaintext customer' });
        addresses.resolveOrCreateForExternalPlatform.mockResolvedValue(address);
        auth.checkUserEntityOwnership.mockResolvedValue(undefined);
        payments.onPaymentCompleted.mockResolvedValue(undefined);
        const module = await Test.createTestingModule({
            providers: [
                ExternalPlatformPaymentService,
                { provide: getRepositoryToken(Payment), useValue: repo },
                { provide: PaymentMapper, useValue: { toDto: (payment: Payment) => Object.assign(new PaymentDTO(), payment) } },
                { provide: PaymentTaxMapper, useValue: { toEntity: tax => tax } },
                { provide: AccountService, useValue: accounts },
                { provide: AddressService, useValue: addresses },
                { provide: AdminSettingsService, useValue: { getAdminSettings: async () => ({ comissionsCalculatedFromNet: true }) } },
                { provide: AppComissionService, useValue: { fetchOneForCalculation: async () => ({ percent: 10 }) } },
                { provide: ExternalPlatformService, useValue: { fetchOne: async () => platform } },
                { provide: PaymentService, useValue: payments },
                { provide: AuthUtilService, useValue: auth },
                { provide: InvoiceAddressMapper, useValue: invoiceAddress },
            ],
        }).compile();
        service = module.get(ExternalPlatformPaymentService);
    });

    it('records a completed purchase with correct amounts, transaction-bound customers and encrypted address snapshots', async () => {
        const dto = await service.createExternalPlatformPayment(input(), user);
        expect(dto).toMatchObject({
            id: 'payment', paymentStatus: 'COMPLETED', totalAmount: 240, taxAmount: 40,
            externalPlatformOrderId: 'order-1', openPayment: false,
        });
        expect(manager.save.mock.calls[0][1].items[0]).toMatchObject({ quantity: 2, totalAmount: 240, unTaxAmount: 200, appComissionAmount: 20 });
        expect(accounts.resolveOrCreateForExternalPlatform).toHaveBeenCalledWith(input().customerAccount, 'platform', undefined, manager);
        expect(addresses.resolveOrCreateForExternalPlatform).toHaveBeenCalledWith(input().billingAddress, 'platform', undefined, manager);
        expect(invoiceAddress.toEntityFromAccountAddress).toHaveBeenCalledWith(address);
        expect(payments.applyAccountSnapshot).toHaveBeenCalledWith({ id: 'customer', name: 'Plaintext customer' }, expect.any(Payment));
        expect(payments.onPaymentCompleted).toHaveBeenCalledTimes(1);
        expect(payments.paymentStream.next).toHaveBeenCalledTimes(1);
        expect(manager.findOne).toHaveBeenCalledWith(ExternalPlatform, expect.objectContaining({ lock: { mode: 'pessimistic_write' } }));
    });

    it('requires authentication before any writes', async () => {
        await expect(service.createExternalPlatformPayment(input(), new UserAuthBackendDTO())).rejects.toBeInstanceOf(UnauthorizedException);
        expect(repo.manager.transaction).not.toHaveBeenCalled();
    });

    it('rejects unauthorized sellers before resolving customer data', async () => {
        auth.checkUserEntityOwnership.mockRejectedValue(new UnauthorizedException());
        await expect(service.createExternalPlatformPayment(input(), user)).rejects.toBeInstanceOf(UnauthorizedException);
        expect(accounts.resolveOrCreateForExternalPlatform).not.toHaveBeenCalled();
    });

    it.each([0, -1, NaN, Infinity])('rejects invalid quantity %s', async quantity => {
        const dto = input();
        dto.items[0].quantity = quantity;
        await expect(service.createExternalPlatformPayment(dto, user)).rejects.toBeInstanceOf(BadRequestException);
        expect(repo.manager.transaction).not.toHaveBeenCalled();
    });

    it.each([-1, 101, NaN, Infinity])('rejects invalid tax rate %s', async taxRate => {
        const dto = input();
        dto.items[0].taxRate = taxRate;
        await expect(service.createExternalPlatformPayment(dto, user)).rejects.toBeInstanceOf(BadRequestException);
        expect(repo.manager.transaction).not.toHaveBeenCalled();
    });

    it('rejects external seller accounts', async () => {
        accounts.fetchOne.mockResolvedValue({ id: 'seller', type: 'COMMERCIAL', isExternal: true, defaultAddressId: 'address' });
        await expect(service.createExternalPlatformPayment(input(), user)).rejects.toBeInstanceOf(BadRequestException);
        expect(repo.manager.transaction).not.toHaveBeenCalled();
    });

    it('rejects existing account IDs and ownership fields', async () => {
        const dto = input();
        dto.customerAccount.id = 'existing-account';
        await expect(service.createExternalPlatformPayment(dto, user)).rejects.toBeInstanceOf(BadRequestException);
        expect(repo.manager.transaction).not.toHaveBeenCalled();
    });

    it('rejects inactive platforms before customer writes', async () => {
        platform.active = false;
        await expect(service.createExternalPlatformPayment(input(), user)).rejects.toBeInstanceOf(BadRequestException);
        expect(accounts.resolveOrCreateForExternalPlatform).not.toHaveBeenCalled();
    });

    it('rejects duplicate orders without creating records or repeating completion', async () => {
        manager.findOne.mockImplementation(async entity => entity === ExternalPlatform ? platform : new Payment());
        await expect(service.createExternalPlatformPayment(input(), user)).rejects.toBeInstanceOf(ConflictException);
        expect(manager.save).not.toHaveBeenCalled();
        expect(payments.onPaymentCompleted).not.toHaveBeenCalled();
    });

    it('surfaces a saved payment ID when completion fails instead of reporting success', async () => {
        payments.onPaymentCompleted.mockRejectedValue(new Error('Completion failed'));
        const log = jest.spyOn(Logger.prototype, 'error').mockImplementation(() => undefined);
        try {
            await expect(service.createExternalPlatformPayment(input(), user)).rejects.toThrow('Payment payment was recorded, but completion processing failed');
            expect(log).toHaveBeenCalled();
            expect(payments.paymentStream.next).not.toHaveBeenCalled();
        } finally {
            log.mockRestore();
        }
    });
});
