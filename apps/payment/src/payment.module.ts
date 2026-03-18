import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Payment } from './entity/payment.entity';
import { PostralPaymentItem } from './entity/payment-item.entity';
import { PaymentService } from './service/payment.service';
import { PaymentController } from './controller/payment.controller';
import { PaymentSearchService } from './service/payment-search.service';
import { PaymentSearchController } from './controller/payment-search.controller';
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
import { ItemMapper } from './mapper/item.mapper';
import { ItemService } from './service/item.service';
import { ItemAdminController } from './controller/item-admin.controller';
import { PaymentTaxMapper } from './mapper/payment-tax.mapper';
import { ItemPriceMapper } from './mapper/item-price.mapper';
import { ItemPriceService } from './service/item-price.service';
import { MicroserviceSetupUtil } from '@ubs-platform/microservice-setup-util';
import { BackendJwtUtilsModule } from '@ubs-platform/users-microservice-helper';
import { ItemSellerController } from './controller/item-seller.controller';
import { SellerPaymentOrderService } from './service/transaction.service';
import { DummyEcommercePaymentChannelController } from './controller/dummy-ecommerce-payment-channel.controller';
import { AccountNewController } from './controller/account-controller';
import { AddressController } from './controller/address-controller';
import { AddressService } from './service/address.service';
import { AddressMapper } from './mapper/address.mapper';
import { ItemCrudService } from './service/item-crud.service';
import { ItemController } from './controller/item-controller';
import { ItemTaxController } from './controller/item-tax.controller';
import { ItemTaxService } from './service/item-tax.service';
import { ItemTaxMapper } from './mapper/item-tax.mapper';
import { MicroserviceController } from './controller/microservice-controller';
import { CalculationController } from './controller/calculation.controller';
import { CalculationService } from './service/calculation.service';
import { PaymentOperationManagementService } from './service/payment-operation-management.service';
import { TransactionSearchController } from './controller/transaction-search.controller';
import { SellerPaymentOrderSearchService } from './service/transaction-search.service';
import { TransactionMapper } from './mapper/transaction.mapper';
import { PaymentItemSearchController } from './controller/payment-item.search.controller';
import { PaymentItemSearchService } from './service/payment-item-search.service';
import { InvoiceController } from './controller/invoice.controller';
import { InvoiceService } from './service/invoice.service';
import { InvoiceMapper } from './mapper/invoice.mapper';
import { InvoiceAddressMapper } from './mapper/invoice-address.mapper';
import { InvoiceAccountMapper } from './mapper/invoice-account.mapper';
import { MulterModule } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { extname } from 'path';
import { PaymentMicroserviceController } from './controller/payment-microservice.controller';
import { AuthUtilService } from './service/auth-util.service';
import { RefundService } from './service/refund.service';
import { RefundController } from './refund.controller';
import { ScheduleModule } from '@nestjs/schedule';
import { LocalEventService } from './service/local-event.service';

@Module({
    imports: [
        ScheduleModule.forRoot(),

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
            logging: ['query', 'error'],
        }),
        ClientsModule.register([
            {
                ...MicroserviceSetupUtil.setupClient('', 'MICROSERVICE_CLIENT'),
            },
        ]),
        BackendJwtUtilsModule,
        MulterModule.register({
            storage: diskStorage({
                destination: './uploads/invoices',
                filename: (req, file, cb) => {
                    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
                    const ext = extname(file.originalname);
                    cb(null, `invoice-${uniqueSuffix}${ext}`);
                },
            }),
        }),
    ],
    exports: [TypeOrmModule],
    providers: [
        AccountService,
        AccountMapper,
        AppComissionService,
        AppComissionMapper,
        PaymentService,
        PaymentSearchService,
        PaymentMapper,
        PaymentItemMapper,
        EventSenderService,
        ItemMapper,
        ItemService,
        ItemCrudService,
        PaymentTaxMapper,
        ItemPriceMapper,
        ItemPriceService,
        SellerPaymentOrderService,
        AddressService,
        AddressMapper,
        ItemTaxMapper,
        ItemTaxService,
        CalculationService,
        PaymentOperationManagementService,
        SellerPaymentOrderSearchService,
        TransactionMapper,
        PaymentSearchService,
        PaymentItemSearchService,
        InvoiceService,
        InvoiceMapper,
        InvoiceAddressMapper,
        InvoiceAccountMapper,
        AuthUtilService,
        RefundService,
        LocalEventService
    ],
    controllers: [
        PaymentController,
        PaymentSearchController,
        AddressController,
        AppComissionController,
        MicroserviceController,
        // ItemSellerController,
        // ItemAdminController,
        ItemController,
        AccountNewController,
        DummyEcommercePaymentChannelController,
        ItemTaxController,
        CalculationController,
        TransactionSearchController,
        PaymentItemSearchController,
        InvoiceController,
        PaymentMicroserviceController,
        RefundController,
    ],
})
export class PaymentModule {}
