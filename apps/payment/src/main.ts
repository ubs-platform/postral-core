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
    } else {
        console.warn(`
            -------------------DİKKAT--------------------
            Versiyon 2'de Payment yapısında büyük değişiklikler yapıldı. Bu nedenle versiyon 1'deki Payment verilerini versiyon 2'ye taşımak için migration işlemi yapılması gerekmektedir.
            Bu işlemi yaptıysanız dikkate almayınız. Eğer yapmadıysanız, Migration işlemi için uygulama başlatılırken --v2-payment-snapshot-migration parametresi ile başlatılması gerekmektedir.
            Örnek: npm run start -- --v2-payment-snapshot-migration
            Docker compose dosyasında da bu bu parametreyi ekledikten sonra yeniden başlatabilirsiniz.

            \`\`\`
            services:
                postral-core-api:
                    ## Diğer parametrelere dokunmayın
                    command: node /app/dist/main.js --v2-payment-snapshot-migration
            \`\`\`

            Bu parametre, bir sonraki minör sürümlerde kaldırılacaktır. Bu nedenle, versiyon 1'den versiyon 2'ye geçiş yapıldıktan sonra bu parametreyi kullanmayı bırakmanız önerilir.
            ---------------------------------------------
            
            ----------ATTENTION----------
            In version 2, major changes were made to the Payment structure. Therefore, it is necessary to perform a migration process to transfer Payment data from version 1 to version 2.
            If you have done this, please disregard. If you haven't, you need to start the application with the --v2-payment-snapshot-migration parameter for the migration process.
            To perform the migration process, the application must be started with the --v2-payment-snapshot-migration parameter.
            Example: npm run start -- --v2-payment-snapshot-migration
            You can also add this parameter to the Docker compose file and restart it after adding it.
            \`\`\`
            services:
                postral-core-api:
                    ## Do not edit other parameters
                    command: node /app/dist/main.js --v2-payment-snapshot-migration
            \`\`\`
           
            This parameter will be removed in the next minor releases. Therefore, it is recommended to stop using this parameter after migrating from version 1 to version 2.
            ---------------------------------------------
            
            
            `);
    }
    await app.listen(port, '0.0.0.0');
    Logger.log(
        `🚀 Application is running on: http://localhost:${port}/${globalPrefix}`,
    );
}
bootstrap();
