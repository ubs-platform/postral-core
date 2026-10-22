import { Controller, Get } from '@nestjs/common';
import { IntegrationIyzicoService } from './integration-iyzico.service';

@Controller()
export class IntegrationIyzicoController {
  constructor(private readonly integrationIyzicoService: IntegrationIyzicoService) {}

  @Get()
  getHello(): string {
    return this.integrationIyzicoService.getHello();
  }
}
