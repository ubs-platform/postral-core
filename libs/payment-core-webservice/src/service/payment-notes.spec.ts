import { BadRequestException } from '@nestjs/common';
import { getMetadataArgsStorage } from 'typeorm';
import { Payment, PostralPaymentItem } from '@tk-postral/postral-entities';
import { MAX_PAYMENT_NOTE_LENGTH, PaymentFullDTO, PaymentInitDTO, PaymentItemDTO } from '@tk-postral/payment-common';
import { PaymentItemMapper } from '../mapper/payment-item.mapper';
import { PaymentMapper } from '../mapper/payment.mapper';
import { PaymentTaxMapper } from '../mapper/payment-tax.mapper';
import { InvoiceAccountMapper } from '../mapper/invoice-account.mapper';
import { InvoiceAddressMapper } from '../mapper/invoice-address.mapper';
import { PaymentOperationManagementService } from './payment-operation-management.service';
import { PaymentService } from './payment.service';

describe('payment notes', () => {
    const snapshotMapper = {
        toDto: jest.fn(),
        toEntityFromNormalAccount: jest.fn(),
        toEntityFromAccountAddress: jest.fn(),
    };

    function createPaymentService() {
        const paymentRepository = {
            save: jest.fn(async (payment: Payment) => Object.assign(payment, { id: 'payment-id' })),
        };
        const paymentTaxMapper = {
            toDto: jest.fn().mockReturnValue([]),
            toEntity: jest.fn(),
        };
        const itemMapper = new PaymentItemMapper(
            snapshotMapper as unknown as InvoiceAddressMapper,
            snapshotMapper as unknown as InvoiceAccountMapper,
        );
        const paymentMapper = new PaymentMapper(
            paymentTaxMapper as unknown as PaymentTaxMapper,
            itemMapper,
            snapshotMapper as unknown as InvoiceAddressMapper,
            snapshotMapper as unknown as InvoiceAccountMapper,
        );
        const item = new PaymentItemDTO({
            itemId: 'item-id',
            name: 'Item',
            note: 'Item note',
            quantity: 1,
            totalAmount: 12,
            taxAmount: 2,
            taxPercent: 20,
            variation: 'standard',
            unTaxAmount: 10,
            originalUnitAmount: 12,
            unitAmount: 12,
            unit: 'C62',
        });
        const calculateTotalAmount = jest.fn().mockResolvedValue({
            items: [item],
            totalAmount: 12,
            totalTaxAmount: 2,
            taxes: [],
        });
        const paymentCommonService = { findPaymentById: jest.fn() };
        const eventSender = {
            onPaymentInitialized: jest.fn(),
            sendPaymentCompletedEvent: jest.fn(),
            initializePaymentChannelOperation: jest.fn(),
        };
        const service = new PaymentService(
            paymentRepository as any,
            paymentMapper,
            itemMapper,
            paymentTaxMapper as any,
            eventSender as any,
            {} as any,
            { fetchOne: jest.fn().mockResolvedValue({ id: 'customer-id', defaultAddressId: 'address-id' }) } as any,
            { calculateTotalAmount } as any,
            {} as any,
            {} as any,
            { insertPaymentToReportDigestionQueue: jest.fn() } as any,
            {} as any,
            paymentCommonService as any,
            { send: jest.fn().mockResolvedValue(undefined) } as any,
            {} as any,
            snapshotMapper as unknown as InvoiceAccountMapper,
            snapshotMapper as unknown as InvoiceAddressMapper,
        );
        jest.spyOn(service, 'applyItemSellerSnapshots').mockResolvedValue(undefined);
        jest.spyOn(service, 'applyAccountSnapshot').mockResolvedValue(undefined);
        jest.spyOn(service, 'applyAddressSnapshot').mockResolvedValue(undefined);

        return { service, paymentMapper, paymentCommonService, eventSender };
    }

    it('persists init notes and includes them in the completed-payment event for ordinary purchases', async () => {
        const { service, paymentMapper, paymentCommonService, eventSender } = createPaymentService();
        const initialized = await service.init(new PaymentInitDTO({
            type: 'PURCHASE',
            note: 'Payment note',
            currency: 'TRY',
            saleMode: 'DEFAULT',
            items: [{ itemId: 'item-id', quantity: 1, note: 'Item note' }],
            customerAccountId: 'customer-id',
        }));
        const persisted = await (service as any).paymentrepo.save.mock.results[0].value as Payment;

        expect(initialized.note).toBe('Payment note');
        expect(persisted.note).toBe('Payment note');
        expect(persisted.items[0].note).toBe('Item note');

        paymentCommonService.findPaymentById.mockResolvedValue(paymentMapper.toFullDto(persisted));
        (service as any).postPaymentOperation = jest.fn().mockResolvedValue(undefined);
        await service.onPaymentCompleted(persisted);

        const completedEvent = eventSender.sendPaymentCompletedEvent.mock.calls[0][0] as PaymentFullDTO;
        expect(completedEvent.note).toBe('Payment note');
        expect(completedEvent.items[0].note).toBe('Item note');
    });

    it('rejects payment or item notes longer than the shared 10,000-character limit', async () => {
        const { service } = createPaymentService();
        const tooLong = 'x'.repeat(MAX_PAYMENT_NOTE_LENGTH + 1);
        await expect(service.init(new PaymentInitDTO({
            type: 'PURCHASE', note: tooLong, items: [], customerAccountId: 'customer-id',
        }))).rejects.toThrow(BadRequestException);
        await expect(service.init(new PaymentInitDTO({
            type: 'PURCHASE', items: [{ itemId: 'item-id', quantity: 1, note: tooLong }],
            customerAccountId: 'customer-id',
        }))).rejects.toThrow(BadRequestException);
    });

    it('stores both note fields in nullable varchar columns with the same bound', () => {
        const metadata = getMetadataArgsStorage();
        for (const target of [Payment, PostralPaymentItem]) {
            expect(metadata.columns.find(column => column.target === target && column.propertyName === 'note')?.options)
                .toMatchObject({ type: 'varchar', length: MAX_PAYMENT_NOTE_LENGTH, nullable: true });
        }
    });

    it('omits payment and item notes from purchase and refund channel initialization payloads', async () => {
        const eventSender = {
            initializePaymentChannelOperation: jest.fn().mockResolvedValue({
                paymentChannelOperationId: 'channel-operation',
                paymentChannelId: 'channel',
                paymentStatus: 'WAITING',
            }),
        };
        const service = new PaymentOperationManagementService(
            eventSender as any,
            {} as any,
            {} as any,
            {
                find: jest.fn().mockResolvedValue([{
                    id: 'purchase-operation',
                    operationId: 'provider-purchase-operation',
                    paymentId: 'purchase-id',
                    paymentChannelId: 'channel',
                    operationType: 'PURCHASE',
                    status: 'COMPLETED',
                    amount: 12,
                    currency: 'TRY',
                }]),
                manager: {
                    transaction: jest.fn(async (callback: (manager: any) => Promise<unknown>) => callback({
                        findOneOrFail: jest.fn().mockResolvedValue({}),
                        findOne: jest.fn().mockResolvedValue(null),
                        save: jest.fn(async (_target: unknown, operation: object) => Object.assign(operation, { id: 'refund-operation' })),
                    })),
                },
            } as any,
        );
        jest.spyOn(service, 'totalPaidOrAuthorizedOf').mockResolvedValue(0);
        jest.spyOn(service, 'savePaymentChannelRecord').mockResolvedValue({} as any);

        const purchase = {
            id: 'purchase-id',
            type: 'PURCHASE',
            totalAmount: 12,
            note: 'Payment note',
            items: [{ id: 'purchase-item', note: 'Item note' }],
            captureInfo: { paymentChannelId: 'channel', paidAmount: 12, currency: 'TRY' },
        };
        await service.startPaymentOperation(purchase as any);
        const purchasePayload = eventSender.initializePaymentChannelOperation.mock.calls[0][1];
        expect(purchasePayload).not.toHaveProperty('note');
        expect(purchasePayload.items[0]).not.toHaveProperty('note');

        const refund = {
            id: 'refund-id',
            type: 'REFUND',
            totalAmount: 12,
            currency: 'TRY',
            note: 'Refund payment note',
            items: [{ id: 'refund-item', note: 'Refund item note' }],
        } as PaymentFullDTO;
        const original = { id: 'purchase-id', type: 'PURCHASE', paymentStatus: 'COMPLETED' } as PaymentFullDTO;
        await service.startRefundPaymentOperationsForRefundRequest(
            { id: 'request-id', items: [] } as any,
            refund,
            original,
        );
        const refundPayload = eventSender.initializePaymentChannelOperation.mock.calls[1][1];
        expect(refundPayload).not.toHaveProperty('note');
        expect(refundPayload.items[0]).not.toHaveProperty('note');
    });
});
