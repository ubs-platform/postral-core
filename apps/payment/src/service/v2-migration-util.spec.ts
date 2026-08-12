import { V2MigrationUtil } from './v2-migration-util';

describe('V2MigrationUtil', () => {
    it('fills missing payment snapshots from the real customer and seller data', async () => {
        const customerAccount = { id: 'customer-1', name: 'Customer', defaultAddressId: 'billing-address-1' };
        const sellerAccount = { id: 'seller-1', name: 'Seller', defaultAddressId: 'seller-address-1' };
        const billingAddress = { id: 'billing-address-1', name: 'Billing Address' };
        const sellerAddress = { id: 'seller-address-1', name: 'Seller Address' };

        const payment = {
            id: 'payment-1',
            customerAccountId: customerAccount.id,
            billingAddressId: billingAddress.id,
            customerSnapshotAccountId: undefined,
            customerSnapshotAddressId: undefined,
            items: [
                {
                    id: 'item-1',
                    sellerAccountId: sellerAccount.id,
                    sellerAccount: sellerAccount,
                    sellerSnapshotAccountId: undefined,
                    sellerSnapshotAddressId: undefined,
                },
            ],
        } as any;

        const util = Object.create(V2MigrationUtil.prototype) as V2MigrationUtil;

        Object.assign(util, {
            snapshotAddressRepository: {
                save: jest.fn(async (input: any) => ({ ...input, id: input.id ?? `snapshot-${Math.random()}` })),
            },
            snapshotAccountRepository: {
                save: jest.fn(async (input: any) => ({ ...input, id: input.id ?? `snapshot-${Math.random()}` })),
            },
            invoiceAddressLegacyRepository: { find: jest.fn() },
            invoiceAccountLegacyRepository: { find: jest.fn() },
            invoiceRepository: { find: jest.fn(), save: jest.fn() },
            paymentRepository: {
                find: jest.fn(async () => [payment]),
                save: jest.fn(async (items: any[]) => items),
            },
            sellerPaymentOrderRepository: {
                find: jest.fn(async () => []),
                save: jest.fn(async (items: any[]) => items),
            },
            accountRepository: {
                findOne: jest.fn(async ({ where }: any) => {
                    if (where.id === customerAccount.id) {
                        return customerAccount;
                    }
                    if (where.id === sellerAccount.id) {
                        return sellerAccount;
                    }
                    return undefined;
                }),
                findOneBy: jest.fn(async ({ id }: any) => {
                    if (id === customerAccount.id) {
                        return customerAccount;
                    }
                    if (id === sellerAccount.id) {
                        return sellerAccount;
                    }
                    return undefined;
                }),
            },
            addressRepository: {
                findOne: jest.fn(async ({ where }: any) => {
                    if (where.id === billingAddress.id) {
                        return billingAddress;
                    }
                    if (where.id === sellerAddress.id) {
                        return sellerAddress;
                    }
                    return undefined;
                }),
            },
        });

        await util.migratePayments();

        expect(payment.customerSnapshotAccountId).toBeDefined();
        expect(payment.customerSnapshotAddressId).toBeDefined();
        expect(payment.items[0].sellerSnapshotAccountId).toBeDefined();
        expect(payment.items[0].sellerSnapshotAddressId).toBeDefined();
    });
});
