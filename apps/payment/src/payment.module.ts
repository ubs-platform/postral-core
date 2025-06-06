import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Payment } from './entity/payment.entity';
import { PostralPaymentItem } from './entity/payment-item.entity';
import { PaymentService } from './service/payment-service';
import { PaymentController } from './controller/payment.controller';
import { PaymentMapper } from './mapper/payment.mapper';
import { PaymentItemMapper } from './mapper/payment-item.mapper';
import { EventManagementService } from './service/event-management.service';
import { ClientsModule, Transport } from '@nestjs/microservices';
import { randomUUID } from 'crypto';
import { PaymentsEntities } from './entity';

@Module({
    imports: [
        TypeOrmModule.forFeature(PaymentsEntities),
        TypeOrmModule.forRoot({
            type: 'mariadb',
            host: 'localhost',
            port: 3306,
            username: 'postral',
            password: 'postral',
            database: 'postral_epos',
            entities: PaymentsEntities,
            synchronize: true,
            metadataTableName: '',
        }),
        ClientsModule.register([
            {
                name: 'KAFKA_CLIENT',
                transport: Transport.KAFKA,
                options: {
                    client: {
                        clientId: 'main',
                        brokers: [`${process.env['NX_KAFKA_URL']}`],
                    },
                    consumer: {
                        groupId: 'tk-lotus' + randomUUID(),
                    },
                },
            },
        ]),
    ],
    exports: [TypeOrmModule],
    providers: [
        PaymentService,
        PaymentMapper,
        PaymentItemMapper,
        EventManagementService,
    ],
    controllers: [PaymentController],
})
export class PaymentModule {}
