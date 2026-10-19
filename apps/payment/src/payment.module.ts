import { Module } from '@nestjs/common';
import { ScheduleModule } from '@nestjs/schedule';
import { TypeOrmModule } from '@nestjs/typeorm';
import { MicroserviceSetupUtil } from '@ubs-platform/microservice-setup-util';
import { PaymentCoreWebserviceModule } from '@tk-postral/payment-core-webservice';
import { PaymentsEntities } from '@tk-postral/postral-entities';

@Module({
    imports: [
        ScheduleModule.forRoot(),
        TypeOrmModule.forRoot({
            type: process.env.POSTRAL_DB_DRIVER as any || 'mariadb',
            host: process.env.POSTRAL_DB_HOST || 'localhost',
            port: process.env.POSTRAL_DB_PORT as any || 3306,
            username: process.env.POSTRAL_DB_USER || 'root',
            password: process.env.POSTRAL_DB_PASSWORD || '',
            database: process.env.POSTRAL_DB_NAME || 'postral_core',
            entities: PaymentsEntities,
            synchronize: true,
            timezone: 'Z',
            logging: (process.env.POSTRAL_DB_LOGGING_FLAGS || 'error').split(',') as any,
            extra: {
                connectionLimit: 5,
            },
        }),
        PaymentCoreWebserviceModule.register(
            MicroserviceSetupUtil.setupClient('', 'MICROSERVICE_CLIENT'),
        ),
    ],
    exports: [TypeOrmModule, PaymentCoreWebserviceModule],
})
export class PaymentModule {}
