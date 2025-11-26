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
    constructor(@Inject('MICROSERVICE_CLIENT') private kfk: ClientKafka) { }

    async onPaymentInitialized(pd: PaymentDTO) {
        await this.kfk.emit('POSTRAL_PAYMENT_INITIALIZED', pd);
    }

    async paymentChannelStarted(pd: PaymentFullDTO): Promise<PaymentChannelStatusDTO> {
        return await lastValueFrom(
            this.kfk.send(`postral/payment-channel/${pd.paymentChannelId}/start`, pd),
        );
    }

    // async paymentCompleted(pd: PaymentDTO) {
    //     await this.kfk.emit('POSTRAL_PAYMENT_COMPLETED', pd);
    // }


}
