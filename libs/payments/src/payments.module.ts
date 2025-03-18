import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Payment } from './entity/payment.entity';
import { PostralPaymentItem } from './entity/payment-item.entity';
import { PaymentService } from './service/payment-service';
import { PaymentController } from './controller/payment.controller';
import { PaymentMapper } from './mapper/payment.mapper';
import { PaymentItemMapper } from './mapper/payment-item.mapper';

@Module({
    imports: [TypeOrmModule.forFeature([Payment, PostralPaymentItem])],
    exports: [TypeOrmModule],
    providers: [PaymentService, PaymentMapper, PaymentItemMapper],
    controllers: [PaymentController],
})
export class PaymentsModule {}
