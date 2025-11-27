import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Payment } from './entity/payment.entity';
import { PostralPaymentItem } from './entity/payment-item.entity';
import { PaymentService } from './service/payment.service';
import { PaymentController } from './controller/payment.controller';
import { PaymentMapper } from './mapper/payment.mapper';
import { PaymentItemMapper } from './mapper/payment-item.mapper';
import { EventSenderService } from './service/event-management.service';
import { ClientsModule, Transport } from '@nestjs/microservices';
import { randomUUID } from 'crypto';
import { PaymentsEntities } from './entity';
import { AccountService } from './service/account.service';
import { AccountMapper } from './mapper/account.mapper';
import { AppComissionService } from './service/app-commission.service';
import { AppComissionMapper } from './mapper/app-comission.mapper';
import { AppComissionController } from './controller/app-comission.controller';
import { AccountController } from './controller/account.controller';
import { ItemMapper } from './mapper/item.mapper';
import { ItemService } from './service/item.service';
import { ItemAdminController } from './controller/item-admin.controller';
import { PaymentTaxMapper } from './mapper/payment-tax.mapper';
import { ItemPriceMapper } from './mapper/item-price.mapper';
import { ItemPriceService } from './service/item-price.service';
import { MicroserviceSetupUtil } from '@ubs-platform/microservice-setup-util';
import { BackendJwtUtilsModule } from '@ubs-platform/users-microservice-helper';
import { AccountUserController } from './controller/account-user.controller';
import { ItemSellerController } from './controller/item-seller.controller';
import { PaymentTransactionService } from './service/transaction.service';

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
                ...MicroserviceSetupUtil.setupClient(
                    'tetakent-postral-client',
                    'MICROSERVICE_CLIENT',
                ),
            },
        ]),
        BackendJwtUtilsModule,
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
        EventSenderService,
        ItemMapper,
        ItemService,
        PaymentTaxMapper,
        ItemPriceMapper,
        ItemPriceService,
        PaymentTransactionService
    ],
    controllers: [
        PaymentController,
        AppComissionController,
        AccountController,
        ItemSellerController,
        ItemAdminController,
        AccountUserController,
    ],
})
export class PaymentModule {}
