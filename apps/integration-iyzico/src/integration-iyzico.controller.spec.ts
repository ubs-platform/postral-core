import { Test, TestingModule } from '@nestjs/testing';
import { IntegrationIyzicoController } from './integration-iyzico.controller';
import { IntegrationIyzicoService } from './integration-iyzico.service';

describe('IntegrationIyzicoController', () => {
  let integrationIyzicoController: IntegrationIyzicoController;

  beforeEach(async () => {
    const app: TestingModule = await Test.createTestingModule({
      controllers: [IntegrationIyzicoController],
      providers: [IntegrationIyzicoService],
    }).compile();

    integrationIyzicoController = app.get<IntegrationIyzicoController>(IntegrationIyzicoController);
  });

  describe('root', () => {
    it('should return "Hello World!"', () => {
      expect(integrationIyzicoController.getHello()).toBe('Hello World!');
    });
  });
});
