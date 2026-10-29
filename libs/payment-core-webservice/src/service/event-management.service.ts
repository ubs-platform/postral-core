import { HttpException, Inject, Injectable } from '@nestjs/common';
import { ClientKafka } from '@nestjs/microservices';
import { PaymentDTO, PaymentFullDTO, PaymentFullWithCaptureInfoDTO, PrepareChannelRefundDTO, PreparedChannelRefund } from '@tk-postral/payment-common';
import { PaymentChannelStatusDTO } from '@tk-postral/payment-common/dto/payment-channel-status';
import { lastValueFrom, timeout } from 'rxjs';
@Injectable()
export class EventSenderService {

    /**
     *
     */
    constructor(@Inject('MICROSERVICE_CLIENT') private kfk: ClientKafka) { }

    async onPaymentInitialized(pd: PaymentDTO) {
        await this.kfk.emit('POSTRAL_PAYMENT_INITIALIZED', pd);
    }

    async paymentChannelStatusCheck(
        paymentChannelId: string,
        paymentOperationId: string,
    ): Promise<PaymentChannelStatusDTO> {
        return await lastValueFrom(
            this.kfk.send(
                `postral/payment-channel/${paymentChannelId}/check`,
                paymentOperationId,
            ),
        );
    }

    /**
     * Ödeme kanalının iptal edildiğini bildirir.
     * @param id Ödeme kanalı kimliği
     * @returns 
     */
    async paymentChannelCancelled(
        paymentChannelId: string,
        paymentOperationId: string,
    ): Promise<PaymentChannelStatusDTO> {
        try {
            return await lastValueFrom(this.kfk.send(`postral/payment-channel/${paymentChannelId}/cancel`, paymentOperationId));
        } catch (error) {
            throw this.toHttpException(error);
        }
    }

    /**
     * Ödeme kanalının yetkilendirilip yetkilendirilmediğini kontrol eder ve yetkilendirilmişse ödeme kanalını tetikler.
     * @param id Ödeme kanalının kimliği
     * @returns 
     */
    async paymentChannelFireIfAuthorized(
        paymentChannelId: string,
        paymentOperationId: string,
    ): Promise<PaymentChannelStatusDTO> {
        return await lastValueFrom(this.kfk.send(`postral/payment-channel/${paymentChannelId}/fire`, paymentOperationId));
    }

    async initializePaymentChannelOperation(
        paymentChannelId: string,
        pd: PaymentFullDTO | PaymentFullWithCaptureInfoDTO,
    ): Promise<PaymentChannelStatusDTO> {
        try {
            return await lastValueFrom(this.kfk.send(`postral/payment-channel/${paymentChannelId}/init`, pd).pipe(timeout(30_000)));
        } catch (error) {
            throw this.toHttpException(error);
        }
    }

    async prepareChannelRefund(paymentChannelId: string, request: PrepareChannelRefundDTO): Promise<PreparedChannelRefund> {
        try {
            return await lastValueFrom(this.kfk.send(
                `postral/payment-channel/${paymentChannelId}/prepare-refund`, request,
            ).pipe(timeout(30_000)));
        } catch (error) {
            throw this.toHttpException(error);
        }
    }

    /** Restores the `{ statusCode, message }` payload sent by a channel's RPC exception filter. */
    private toHttpException(error: unknown): unknown {
        const statusCode = (error as { statusCode?: unknown } | null)?.statusCode;
        if (typeof statusCode !== 'number' || statusCode < 400 || statusCode > 599) {
            return error;
        }
        const { message } = error as { message?: unknown };
        return new HttpException({ statusCode, message }, statusCode);
    }

    /**
     * Ödeme kanalından iade işlemini başlatır.
     * @param paymentChannelId Ödeme kanalının kimliği
     * @param paymentOperationId Orjinal ödeme operasyon kimliği
     * @returns 
     */
    async paymentChannelRefund(
        paymentChannelId: string,
        paymentOperationId: string,
    ): Promise<PaymentChannelStatusDTO> {
        return await lastValueFrom(this.kfk.send(`postral/payment-channel/${paymentChannelId}/refund`, paymentOperationId));
    }

    sendDigestionQueueInsertionEvent(paymentId: string): void {
        this.kfk.emit('postral/report-digestion-queue-insertion', { paymentId });
    }

    sendPaymentCompletedEvent(paymentFullDTO: PaymentFullDTO): void {
        this.kfk.emit('postral/payment-completed', paymentFullDTO);
    }

}
