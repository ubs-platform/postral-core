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
import { AccountService } from './service/account.service';
import { AccountMapper } from './mapper/account.mapper';
import { AppComissionService } from './service/app-commission.service';
import { AppComissionMapper } from './mapper/app-comission.mapper';
import { AppComissionController } from './controller/app-controller.controller';
import { AccountController } from './controller/account.controller';
import { ItemMapper } from './mapper/item.mapper';
import { ItemService } from './service/item.service';
import { ItemController } from './controller/item.controller';
import { PaymentTaxMapper } from './mapper/payment-tax.mapper';

@Module({
    imports: [
        TypeOrmModule.forFeature(PaymentsEntities),
        TypeOrmModule.forRoot({
            type: 'mariadb',
            host: 'localhost',
            port: 3306,
            username: 'root',
            password: '',
            database: 'postral_core',
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
                        groupId: 'tk-postral-' + randomUUID(),
                    },
                },
            },
        ]),
    ],
    exports: [TypeOrmModule],
    providers: [
        AccountService,
        AccountMapper,
        AppComissionService,
        AppComissionMapper,
        PaymentService,
        PaymentMapper,
        PaymentItemMapper,
        EventManagementService,
        ItemMapper,
        ItemService,
        PaymentTaxMapper,
    ],
    controllers: [
        PaymentController,
        AppComissionController,
        AccountController,
        ItemController,
    ],
})
export class PaymentModule {}
