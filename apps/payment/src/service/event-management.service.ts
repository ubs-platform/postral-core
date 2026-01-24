import { Inject, Injectable } from '@nestjs/common';
import { ClientKafka } from '@nestjs/microservices';
import { PaymentDTO, PaymentFullDTO } from '@tk-postral/payment-common';
import { PaymentChannelStatusDTO } from '@tk-postral/payment-common/dto/payment-channel-status';
import { lastValueFrom } from 'rxjs';
@Injectable()
export class EventSenderService {
    /**
     *
     */
    constructor(@Inject('MICROSERVICE_CLIENT') private kfk: ClientKafka) {}

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
        return await lastValueFrom(this.kfk.send(`postral/payment-channel/${paymentChannelId}/cancel`, paymentOperationId));
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
        pd: PaymentFullDTO,
    ): Promise<PaymentChannelStatusDTO> {
        return await lastValueFrom(this.kfk.send(`postral/payment-channel/${paymentChannelId}/init`, pd));
    }

}
