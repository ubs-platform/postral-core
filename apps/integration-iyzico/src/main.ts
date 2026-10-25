import { NestFactory } from '@nestjs/core';
import { Logger } from '@nestjs/common';
import { MicroserviceSetupUtil } from '@ubs-platform/microservice-setup-util';
import {
    FastifyAdapter,
    NestFastifyApplication,
} from '@nestjs/platform-fastify';
import { IntegrationIyzicoModule } from './integration-iyzico.module';

async function bootstrap() {
    const adapter = new FastifyAdapter({ bodyLimit: 4096 });
    const app = await NestFactory.create<NestFastifyApplication>(
        IntegrationIyzicoModule,
        adapter,
    );
    const globalPrefix = 'api';
    app.connectMicroservice(
        MicroserviceSetupUtil.setupServer(
            'tetakent-postral-integration-iyzico',
        ),
    );
    app.setGlobalPrefix(globalPrefix);
    const port = process.env.PORT || 3768;
    await app.startAllMicroservices();
    await app.listen(port, '0.0.0.0');
    Logger.log(
        `🚀 Application is running on: http://localhost:${port}/${globalPrefix}`,
    );
}
void bootstrap();
