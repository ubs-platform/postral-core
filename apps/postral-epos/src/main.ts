import { NestFactory } from '@nestjs/core';
import { PostralEposModule } from './postral-epos.module';

async function bootstrap() {
    const app = await NestFactory.create(PostralEposModule);
    await app.listen(process.env.port ?? 3767);
}
bootstrap();
