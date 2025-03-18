import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PaymentsEntities, PaymentsModule } from '@tk-postral/payments';
import { exec } from 'child_process';
console.debug('Dirname: ', __dirname);
@Module({
    imports: [
        TypeOrmModule.forRoot({
            type: 'mariadb',
            host: 'localhost',
            port: 3306,
            username: 'postral',
            password: 'postral',
            database: 'postral_epos',
            entities: [...PaymentsEntities],
            synchronize: true,
            metadataTableName: '',
        }),
        PaymentsModule,
    ],
    controllers: [],
    providers: [],
})
export class PostralEposModule {}
