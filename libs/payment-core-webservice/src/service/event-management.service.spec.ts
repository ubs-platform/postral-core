import { HttpException } from '@nestjs/common';
import { throwError } from 'rxjs';
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
