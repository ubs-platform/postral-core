import { Test } from '@nestjs/testing';
import { PaymentItemDTO } from '@tk-postral/payment-common';
import { PostralPaymentItem } from '@tk-postral/postral-entities';
import { PaymentItemMapper } from './payment-item.mapper';
import { InvoiceAccountMapper } from './invoice-account.mapper';
import { InvoiceAddressMapper } from './invoice-address.mapper';

describe('PaymentItemMapper original item identity', () => {
    let mapper: PaymentItemMapper;

    beforeEach(async () => {
        const module = await Test.createTestingModule({
            providers: [
                PaymentItemMapper,
                { provide: InvoiceAccountMapper, useValue: {} },
                { provide: InvoiceAddressMapper, useValue: {} },
            ],
        }).compile();
        mapper = module.get(PaymentItemMapper);
    });

    it('persists and exposes the original ID without reusing the refund item primary key', () => {
        const entity = mapper.toEntity(new PaymentItemDTO({
            id: 'new-refund-item', originalPaymentItemId: 'purchase-item', totalAmount: 3.3333,
        }));
        expect(entity.id).toBeUndefined();
        expect(entity.originalPaymentItemId).toBe('purchase-item');
        entity.id = 'persisted-refund-item';
        expect(mapper.toDto([entity])[0]).toMatchObject({
            id: 'persisted-refund-item', originalPaymentItemId: 'purchase-item', totalAmount: 3.3333,
        });
    });

    it.each([undefined, null])('keeps purchases and legacy items without an original link (%s)', originalPaymentItemId => {
        const entity = Object.assign(new PostralPaymentItem(), { id: 'purchase-item', originalPaymentItemId });
        const dto = mapper.toDto([entity])[0];
        expect(dto.originalPaymentItemId).toBe(originalPaymentItemId);
        expect(mapper.toEntity(dto).originalPaymentItemId).toBe(originalPaymentItemId);
    });
});
