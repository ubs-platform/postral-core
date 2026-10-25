import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import request from 'supertest';
import { App } from 'supertest/types';
import { IntegrationIyzicoController } from './../src/integration-iyzico.controller';
import { IntegrationIyzicoService } from './../src/integration-iyzico.service';

describe('IntegrationIyzicoController (e2e)', () => {
    let app: INestApplication<App>;

    beforeEach(async () => {
        const moduleFixture: TestingModule = await Test.createTestingModule({
            controllers: [IntegrationIyzicoController],
            providers: [{ provide: IntegrationIyzicoService, useValue: {} }],
        }).compile();

        app = moduleFixture.createNestApplication();
        await app.init();
    });

    it('/iyzico/health (GET)', () => {
        return request(app.getHttpServer())
            .get('/iyzico/health')
            .expect(200)
            .expect({ mode: 'sandbox' });
    });

    afterEach(async () => {
        await app.close();
    });
});
