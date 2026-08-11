import { NestFactory } from '@nestjs/core';
import { Logger } from '@nestjs/common';
import { MicroserviceSetupUtil } from '@ubs-platform/microservice-setup-util';
import {
    NestFastifyApplication,
    FastifyAdapter,
} from '@nestjs/platform-fastify';
import fastifyMultipart from '@fastify/multipart';
import { PaymentModule } from './payment.module';
import { DataSource } from 'typeorm';
import { PaymentsEntities } from '@tk-postral/postral-entities';


// async function databaseMigration() {
//     const ads = new DataSource({
//         type: process.env.POSTRAL_DB_DRIVER as any || 'mariadb',
//         host: process.env.POSTRAL_DB_HOST || 'localhost',
//         port: process.env.POSTRAL_DB_PORT as any || 3306,
//         username: process.env.POSTRAL_DB_USER || 'root',
//         password: process.env.POSTRAL_DB_PASSWORD || '',
//         database: process.env.POSTRAL_DB_NAME || 'postral_core',
//         entities: PaymentsEntities,
//         synchronize: true,
//         timezone: 'Z',
//         logging: (process.env.POSTRAL_DB_LOGGING_FLAGS || "error").split(',') as any,
//         extra: {
//             connectionLimit: 5
//         }
//     });
//     try {


//         await ads.initialize();

//         //     await ads.query(`CREATE UNIQUE INDEX UQ_app_comission_seller_item_platform 
//         // ON AppComission (sellerAccountId, itemClass, externalPlatformId);`);
//         await ads.transaction(async (transactionalEntityManager) => {
//             await transactionalEntityManager.query(`
//                 ALTER TABLE AppComission DROP CONSTRAINT IF EXISTS x
//                 ALTER TABLE AppComission ADD CONSTRAINT UQ_app_comission_seller_item_platform UNIQUE (sellerAccountId, itemClass, externalPlatformId);
                
//                 -- DROP INDEX IF EXISTS IDX_6d18c0778efc1749258e8ad3bb ON AppComission;
//             `);
//             Logger.log('Database migration completed');

//         });

//     } catch (error) {
//         Logger.error('Database migration failed', error);
//         throw error;
//     } finally {
//         try {
//             Logger.log('Closing database connection');
//             await ads.destroy();
//         } catch (error) {
//             Logger.error('Failed to close database connection', error);
//         }
//     }
// }

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
    await app.listen(port, '0.0.0.0');
    Logger.log(
        `🚀 Application is running on: http://localhost:${port}/${globalPrefix}`,
    );
}
bootstrap();
