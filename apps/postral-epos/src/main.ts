import { NestFactory } from '@nestjs/core';
import { PostralEposModule } from './postral-epos.module';
import { Logger } from '@nestjs/common';
import { MicroserviceSetupUtil } from '@ubs-platform/microservice-setup-util';
import {
    FastifyAdapter,
    NestFastifyApplication,
} from '@nestjs/platform-fastify';
import fastifyMultipart from '@fastify/multipart';

async function bootstrap() {
    const app = await NestFactory.create<NestFastifyApplication>(
        PostralEposModule,
        new FastifyAdapter(),
    );
    const globalPrefix = 'api';
    app.register(fastifyMultipart);
    app.connectMicroservice(
        MicroserviceSetupUtil.getMicroserviceConnection(''),
    );
    app.setGlobalPrefix(globalPrefix);
    const port = process.env.PORT || 3000;
    app.startAllMicroservices();
    await app.listen(port, '0.0.0.0');
    Logger.log(
        `🚀 Application is running on: http://localhost:${port}/${globalPrefix}`,
    );
}
bootstrap();
