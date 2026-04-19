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
import { PaymentTaxMapper } from './mapper/payment-tax.mapper';
import { ItemPriceMapper } from './mapper/item-price.mapper';
import { ItemPriceService } from './service/item-price.service';
import { MicroserviceSetupUtil } from '@ubs-platform/microservice-setup-util';
import { BackendJwtUtilsModule } from '@ubs-platform/users-microservice-helper';
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
import { AccountPaymentTransactionService } from './service/account-payment-transaction.service';
import { AccountPaymentTransactionMapper } from './mapper/account-payment-transaction.mapper';
import { ReportQueryCrudService } from './service/report-query.service';
import { ReportQueryMapper } from './mapper/report-query.mapper';
import { ReportService } from './service/report.service';
import { ReportDigestionService } from './service/report-digestion.service';
import { ReportQueryController } from './controller/report-query.controller';
import { PaymentCommonService } from './service/payment-common.service';
import { ReportController } from './controller/report.controller';
import { ReportMapper } from './mapper/report-mapper';
import { AdminSettingsController } from './controller/admin-settings.controller';
import { AdminSettingsService } from './service/admin-settings.service';
import { CryptionUtil } from './util/cryption-util';
import { AdminOperationsService } from './service/admin-operations.service';
import { AdminOperationsController } from './controller/admin-operations.controller';

@Module({
    imports: [
        ScheduleModule.forRoot(),

        TypeOrmModule.forFeature(PaymentsEntities),
        TypeOrmModule.forRoot({
            type: process.env.POSTRAL_DB_DRIVER as any || 'mariadb',
            host: process.env.POSTRAL_DB_HOST || 'localhost',
            port: process.env.POSTRAL_DB_PORT as any || 3306,
            username: process.env.POSTRAL_DB_USER || 'root',
            password: process.env.POSTRAL_DB_PASSWORD || '',
            database: process.env.POSTRAL_DB_NAME || 'postral_core',
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
        AccountPaymentTransactionService,
        AccountPaymentTransactionMapper,
        AuthUtilService,
        RefundService,
        ReportQueryCrudService,
        ReportQueryMapper,
        ReportService,
        ReportDigestionService,
        PaymentCommonService,
        ReportMapper,
        AdminSettingsService,
        CryptionUtil,
        AdminOperationsService,
    ],
    controllers: [
        PaymentController,
        PaymentSearchController,
        AddressController,
        AppComissionController,
        MicroserviceController,
        ReportController,
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
        ReportQueryController,
        AdminSettingsController,
        AdminOperationsController
    ],
})
export class PaymentModule { }
