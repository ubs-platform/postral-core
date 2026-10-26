import { ArgumentsHost, BadRequestException } from '@nestjs/common';
import { lastValueFrom } from 'rxjs';
import { HttpToRpcExceptionFilter } from './http-to-rpc-exception.filter';

describe('HttpToRpcExceptionFilter', () => {
    it('keeps the HTTP status and message in the RPC error payload', async () => {
        const result = new HttpToRpcExceptionFilter().catch(
            new BadRequestException(
                'iyzico requires customerSnapshotAccount.emailAddress',
            ),
            {} as ArgumentsHost,
        );

        await expect(lastValueFrom(result)).rejects.toEqual({
            status: 'error',
            statusCode: 400,
            message: 'iyzico requires customerSnapshotAccount.emailAddress',
        });
    });
});
