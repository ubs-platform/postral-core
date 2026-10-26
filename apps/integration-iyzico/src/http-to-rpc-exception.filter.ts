import { ArgumentsHost, Catch, HttpException } from '@nestjs/common';
import { BaseRpcExceptionFilter } from '@nestjs/microservices';
import { throwError } from 'rxjs';

/**
 * TODO: Hata fırlatma olayını UBS-Mona'ya ekleyebiliriz, sonra buradan da dependency olarak kullanabiliriz.
 * Nest's default RPC filter reduces every non-RpcException to
 * "Internal server error"; keep the HTTP status and message for the caller.
 */
@Catch(HttpException)
export class HttpToRpcExceptionFilter extends BaseRpcExceptionFilter {
    override catch(exception: HttpException, _host: ArgumentsHost) {
        const response = exception.getResponse();
        const message =
            typeof response === 'string'
                ? response
                : ((response as { message?: unknown }).message ??
                  exception.message);
        return throwError(() => ({
            status: 'error',
            statusCode: exception.getStatus(),
            message,
        }));
    }
}
