import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PostralEntitiesModule, PaymentsEntities } from '@tk-postral/postral-entities';
import { Axios } from "axios";
import { LoginOperator } from './chapters/login-operator';


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
  ],
  controllers: [],
  providers: [{
    provide: Axios,
    useValue: new Axios()
  },LoginOperator],
})
export class TestoModule { }
