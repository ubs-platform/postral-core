import { NestFactory } from '@nestjs/core';
import { Logger } from '@nestjs/common';
import { MicroserviceSetupUtil } from '@ubs-platform/microservice-setup-util';
import {
    NestFastifyApplication,
    FastifyAdapter,
} from '@nestjs/platform-fastify';
import { PaymentModule } from './payment.module';
import { V2MigrationUtil } from './service/v2-migration-util';


async function bootstrap() {
    // await databaseMigration();
    const adapter = new FastifyAdapter();
    // adapter.register(fastifyMultipart);
    const app = await NestFactory.create<NestFastifyApplication>(
        PaymentModule,
        adapter,
    );
    const globalPrefix = 'api';
    app.connectMicroservice(
        MicroserviceSetupUtil.setupServer('tetakent-postral-payment'),
    );
    app.setGlobalPrefix(globalPrefix);
    const port = process.env.PORT || 3000;
    await app.startAllMicroservices();
    if (process.argv.includes('--v2-payment-snapshot-migration')) {
        const a = app.get(V2MigrationUtil);
        await a.doMigration();
    }
    await app.listen(port, '0.0.0.0');
    Logger.log(
        `🚀 Application is running on: http://localhost:${port}/${globalPrefix}`,
    );
}
bootstrap();
