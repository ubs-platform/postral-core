import { HttpException } from '@nestjs/common';
import { of, throwError } from 'rxjs';
import { Test } from '@nestjs/testing';
import { PrepareChannelRefundDTO } from '@tk-postral/payment-common';
import { EventSenderService } from './event-management.service';

describe('EventSenderService.initializePaymentChannelOperation', () => {
    const init = (error: unknown) =>
        new EventSenderService({
            send: () => throwError(() => error),
        } as any).initializePaymentChannelOperation('iyzico', {} as any);

    it('restores channel HTTP errors sent over RPC', async () => {
        const error = await init({
            status: 'error',
            statusCode: 400,
            message: 'iyzico requires customerSnapshotAccount.emailAddress',
        }).catch((e) => e);

        expect(error).toBeInstanceOf(HttpException);
        expect(error.getStatus()).toBe(400);
        expect(error.getResponse()).toEqual({
            statusCode: 400,
            message: 'iyzico requires customerSnapshotAccount.emailAddress',
        });
    });

    it('rethrows unknown RPC errors unchanged', async () => {
        const unknown = { status: 'error', message: 'Internal server error' };
        await expect(init(unknown)).rejects.toBe(unknown);
    });
});

describe('EventSenderService.prepareChannelRefund', () => {
    const request: PrepareChannelRefundDTO = {
        purchasePaymentId: 'purchase',
        purchaseAmount: 10,
        currency: 'TRY',
        captures: [],
        items: [],
    };

    it('routes preparation to any channel without changing its response', async () => {
        const result = { plans: [] };
        const transport = { send: jest.fn().mockReturnValue(of(result)) };
        const module = await Test.createTestingModule({
            providers: [
                EventSenderService,
                { provide: 'MICROSERVICE_CLIENT', useValue: transport },
            ],
        }).compile();
        expect(
            await module
                .get(EventSenderService)
                .prepareChannelRefund('arbitrary-provider', request),
        ).toEqual(result);
        expect(transport.send).toHaveBeenCalledWith(
            'postral/payment-channel/arbitrary-provider/prepare-refund',
            request,
        );
    });

    it('surfaces preparation RPC errors instead of falling back to unprepared initialization', async () => {
        const transport = {
            send: jest.fn().mockReturnValue(
                throwError(() => ({
                    statusCode: 400,
                    message: 'Unsupported refund precision',
                })),
            ),
        };
        const module = await Test.createTestingModule({
            providers: [
                EventSenderService,
                { provide: 'MICROSERVICE_CLIENT', useValue: transport },
            ],
        }).compile();
        await expect(
            module
                .get(EventSenderService)
                .prepareChannelRefund('arbitrary-provider', request),
        ).rejects.toThrow('Unsupported refund precision');
        expect(transport.send).toHaveBeenCalledTimes(1);
    });
});
