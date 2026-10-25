import { Module } from '@nestjs/common';
import { IntegrationIyzicoController } from './integration-iyzico.controller';
import { IntegrationIyzicoService } from './integration-iyzico.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { MicroservicesCommonModule, MicroserviceSetupUtil } from '@ubs-platform/microservice-setup-util';
import { IyzicoOperation } from './iyzico-operation.entity';
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
            entities: [IyzicoOperation],
            synchronize: process.env.IYZICO_DB_SYNCHRONIZE === 'true',
            timezone: 'Z',
            extra: { connectionLimit: 5 },
        }),
        TypeOrmModule.forFeature([IyzicoOperation]),
        // MicroserviceSetupUtil.setupClient('', 'MICROSERVICE_CLIENT'),
        ClientsModule.register([MicroserviceSetupUtil.setupClient('', 'MICROSERVICE_CLIENT')]),
    ],
    controllers: [IntegrationIyzicoController],
    providers: [IntegrationIyzicoService, IyzicoClientService],
})
export class IntegrationIyzicoModule {}
