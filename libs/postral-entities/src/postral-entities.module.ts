import { Module } from '@nestjs/common';
import { Payment } from './entity/payment.entity';
import { PostralPaymentItem } from './entity/payment-item.entity';
import { PaymentsEntities } from './entity';
import { TypeOrmModule } from '@nestjs/typeorm';

@Module({
  imports: [TypeOrmModule.forFeature(PaymentsEntities)],
  providers: [],
  exports: [TypeOrmModule],
})
export class PostralEntitiesModule {}
