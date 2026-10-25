import { Body, Controller, Get, Param, Post, Query, Res } from '@nestjs/common';
import { MessagePattern } from '@nestjs/microservices';
import { PaymentFullWithCaptureInfoDTO } from '@tk-postral/payment-common';
import { FastifyReply } from 'fastify';
import { IntegrationIyzicoService } from './integration-iyzico.service';

@Controller('iyzico')
export class IntegrationIyzicoController {
    constructor(
        private readonly integrationIyzicoService: IntegrationIyzicoService,
    ) {}

    @Get('health')
    health() {
        return { mode: 'sandbox' };
    }

    @MessagePattern('postral/payment-channel/iyzico/init')
    initialize(payment: PaymentFullWithCaptureInfoDTO) {
        return this.integrationIyzicoService.initialize(payment);
    }

    @MessagePattern('postral/payment-channel/iyzico/check')
    check(operationId: string) {
        return this.integrationIyzicoService.check(operationId);
    }

    @MessagePattern('postral/payment-channel/iyzico/fire')
    fire(operationId: string) {
        return this.integrationIyzicoService.fire(operationId);
    }

    @MessagePattern('postral/payment-channel/iyzico/cancel')
    cancel(operationId: string) {
        return this.integrationIyzicoService.cancel(operationId);
    }

    @Get('operation/:id')
    async launch(
        @Param('id') id: string,
        @Query('redirectUrl') redirectUrl: unknown,
        @Res() reply: FastifyReply,
    ) {
        const target = await this.integrationIyzicoService.launch(
            id,
            redirectUrl,
        );
        return reply
            .header('Cache-Control', 'no-store')
            .header('Referrer-Policy', 'no-referrer')
            .redirect(target, 302);
    }

    @Post('callback/:id')
    async callback(
        @Param('id') id: string,
        @Body() body: { token?: unknown } | undefined,
        @Res() reply: FastifyReply,
    ) {
        const operation = await this.integrationIyzicoService.callback(
            id,
            body?.token,
        );
        await this.integrationIyzicoService.notify(id);
        const target = this.integrationIyzicoService.returnUrl(operation);
        reply
            .header('Cache-Control', 'no-store')
            .header('Referrer-Policy', 'no-referrer');
        return target
            ? reply.redirect(target, 303)
            : reply.send(this.integrationIyzicoService.toStatus(operation));
    }
}
