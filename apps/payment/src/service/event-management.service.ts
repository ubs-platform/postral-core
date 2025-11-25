import { Inject, Injectable } from '@nestjs/common';
import { ClientKafka } from '@nestjs/microservices';
import { PaymentDTO } from '@tk-postral/payment-common';
@Injectable()
export class EventManagementService {
    /**
     *
     */
    constructor(@Inject('MICROSERVICE_CLIENT') private kfk: ClientKafka) {}

    async onPaymentInitialized(pd: PaymentDTO) {
        await this.kfk.emit('POSTRAL_PAYMENT_INITIALIZED', pd);
    }

    
}
