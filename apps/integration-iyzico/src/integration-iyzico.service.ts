import { Injectable } from '@nestjs/common';

@Injectable()
export class IntegrationIyzicoService {
  getHello(): string {
    return 'Hello World!';
  }
}
