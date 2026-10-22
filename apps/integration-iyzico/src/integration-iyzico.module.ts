import { Module } from '@nestjs/common';
import { IntegrationIyzicoController } from './integration-iyzico.controller';
import { IntegrationIyzicoService } from './integration-iyzico.service';

@Module({
  imports: [],
  controllers: [IntegrationIyzicoController],
  providers: [IntegrationIyzicoService],
})
export class IntegrationIyzicoModule {}
