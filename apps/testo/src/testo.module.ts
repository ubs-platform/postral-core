import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PostralEntitiesModule, PaymentsEntities } from '@tk-postral/postral-entities';
import { LoginOperator } from './services/driver/login-operator';
import { HttpModule } from '@nestjs/axios';
import { PostralClientsModule } from './services/client/clients.module';
import { MainDriverService } from './services/driver/main-driver';
import { CommissionDriverService } from './services/driver/commission-driver.service';
import { AddressDriverService } from './services/driver/address-driver.service';
import { AccountDriverService } from './services/driver/account-driver.service';
import { TaxDriverService } from './services/driver/tax-driver.service';
import { ItemDriverService } from './services/driver/item-driver.service';
import { ReportDriverService } from './services/driver/report-driver.service';

@Module({
  imports: [
    PostralEntitiesModule,
    TypeOrmModule.forRoot({
      type: process.env.POSTRAL_DB_DRIVER as any || 'mariadb',
      host: process.env.POSTRAL_DB_HOST || 'localhost',
      port: process.env.POSTRAL_DB_PORT as any || 3306,
      username: process.env.POSTRAL_DB_USER || 'root',
      password: process.env.POSTRAL_DB_PASSWORD || '',
      database: process.env.POSTRAL_DB_NAME || 'postral_core',
      entities: PaymentsEntities,
      synchronize: true,
      logging: (process.env.POSTRAL_DB_LOGGING_FLAGS || "error").split(',') as any,
      extra: {
        connectionLimit: 5
      }
    }),
    HttpModule.register({
      timeout: 5000,
      maxRedirects: 5,
    }),
    PostralClientsModule
  ],
  controllers: [],
  providers: [
    LoginOperator,
    MainDriverService,
    CommissionDriverService,
    AddressDriverService,
    AccountDriverService,
    TaxDriverService,
    ItemDriverService,
    ReportDriverService,
  ],
})
export class TestoModule { }
