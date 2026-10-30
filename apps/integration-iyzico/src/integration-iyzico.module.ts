import { Module } from '@nestjs/common';
import { IntegrationIyzicoController } from './integration-iyzico.controller';
import { IntegrationIyzicoService } from './integration-iyzico.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { MicroservicesCommonModule, MicroserviceSetupUtil } from '@ubs-platform/microservice-setup-util';
import { IyzicoOperation } from './iyzico-operation.entity';
import { IyzicoRefund } from './iyzico-refund.entity';
import { IyzicoRefundService } from './iyzico-refund.service';
import { IyzicoSubMerchant } from './iyzico-sub-merchant.entity';
import { IyzicoSubMerchantService } from './iyzico-sub-merchant.service';
import { IyzicoClientService } from './iyzico-client.service';
import { ClientsModule, NestMicroservice } from '@nestjs/microservices';

@Module({
    imports: [
        TypeOrmModule.forRoot({
            type: 'mariadb',
            host: process.env.POSTRAL_DB_HOST || 'localhost',
            port: Number(process.env.POSTRAL_DB_PORT || 3306),
            username: process.env.POSTRAL_DB_USER || 'root',
            password: process.env.POSTRAL_DB_PASSWORD || '',
            database: process.env.POSTRAL_DB_NAME || 'postral_core',
            entities: [IyzicoOperation, IyzicoRefund, IyzicoSubMerchant],
            synchronize: process.env.IYZICO_DB_SYNCHRONIZE === 'true',
            timezone: 'Z',
            extra: { connectionLimit: 5 },
        }),
        TypeOrmModule.forFeature([IyzicoOperation, IyzicoRefund, IyzicoSubMerchant]),
        // MicroserviceSetupUtil.setupClient('', 'MICROSERVICE_CLIENT'),
        ClientsModule.register([MicroserviceSetupUtil.setupClient('', 'MICROSERVICE_CLIENT')]),
    ],
    controllers: [IntegrationIyzicoController],
    providers: [IntegrationIyzicoService, IyzicoClientService, IyzicoRefundService, IyzicoSubMerchantService],
})
export class IntegrationIyzicoModule {}
