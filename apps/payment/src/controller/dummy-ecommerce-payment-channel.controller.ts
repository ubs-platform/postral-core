import {
    Controller,
    Get,
    Inject,
    Param,
    Post,
    Query,
    Redirect,
    Res,
    Response,
} from '@nestjs/common';
import { ClientKafka, MessagePattern } from '@nestjs/microservices';
import {
    PaymentDTO,
    PaymentFullDTO,
    PaymentFullWithCaptureInfoDTO,
    PaymentOperationStatus,
    PaymentStatus,
} from '@tk-postral/payment-common';
import { PaymentChannelStatusDTO } from '@tk-postral/payment-common/dto/payment-channel-status';
import { exec } from 'child_process';
import { ReturnDocument } from 'typeorm';
import { FastifyReply } from 'fastify';
@Controller('dummy-ecommerce-payment-channel')
export class DummyEcommercePaymentChannelController {
    // This is a dummy controller for ecommerce payment channel simulation

    /**
     *
     */
    constructor(@Inject('MICROSERVICE_CLIENT') private kfk: ClientKafka) {

    }

    readonly statusMapByOperationId: Map<string, PaymentOperationStatus> =
        new Map();

    // # MessagePattern handlers for microservice communication
    @MessagePattern('postral/payment-channel/dummy-ecommerce/init')
    async handleStartPaymentOperation(paymentDto: PaymentFullWithCaptureInfoDTO) {
        // Payment geldiğinde refund olup olmadığını kontrol edebiliriz. Ödeme ile ilgili entegrasyonda bu kontrol ile ayrı istekler atabiliriz. 
        return this.startPaymentOperation(paymentDto);
    }

    @MessagePattern('postral/payment-channel/dummy-ecommerce/fire')
    async fireTheAuthorizedPayment(operationId: string) {
        if (!this.statusMapByOperationId.has(operationId)) {
            throw new Error('Operation not found');
        }
        if (this.statusMapByOperationId.get(operationId) === 'FAILED') {
            throw new Error('Payment operation is not success, cannot fire.');
        }
        this.statusMapByOperationId.set(operationId, 'COMPLETED');
        return {
            paymentChannelId: 'dummy-ecommerce',
            paymentChannelOperationId: operationId,
            redirectUrl: `dummy-ecommerce-payment-channel/pay/${operationId}`,
            paymentStatus: 'COMPLETED',
        } as PaymentChannelStatusDTO;
    }

    @MessagePattern('postral/payment-channel/dummy-ecommerce/cancel')
    async cancelPayment(operationId: string) {
        if (!this.statusMapByOperationId.has(operationId)) {
            throw new Error('Operation not found');
        }
        this.statusMapByOperationId.set(operationId, 'FAILED');
        return {
            paymentChannelId: 'dummy-ecommerce',
            paymentChannelOperationId: operationId,
            redirectUrl: `dummy-ecommerce-payment-channel/pay/${operationId}`,
            paymentStatus: 'FAILED',
        } as PaymentChannelStatusDTO;
    }

    @MessagePattern('postral/payment-channel/dummy-ecommerce/check')
    async checkPayment(
        paymentOperationId: string,
    ): Promise<PaymentChannelStatusDTO> {
        return {
            paymentChannelId: 'dummy-ecommerce',
            paymentChannelOperationId: paymentOperationId,
            redirectUrl: `dummy-ecommerce-payment-channel/pay/${paymentOperationId}`,
            paymentStatus:
                this.statusMapByOperationId.get(paymentOperationId) || 'FAILED',
        } as PaymentChannelStatusDTO;
    }


    // HTTP Endpoints for simulating payment process

    @Post('/operation')
    async startPaymentOperation(paymentDto: PaymentFullWithCaptureInfoDTO) {
        const fee = paymentDto.totalAmount * 0.1 + 0.1; // Örnek olarak %10 ve 10 kuruş daha komisyon alalım. Ödeme sağlayıcılarının salak salak hesapları var :d bir tane örnek deneyelim. 100 TL'lik ödeme için 10 TL + 0.1 TL = 10.1 TL komisyon alırız. 1000 TL'lik ödeme için 100 TL + 0.1 TL = 100.1 TL komisyon alırız. 10 TL'lik ödeme için 1 TL + 0.1 TL = 1.1 TL komisyon alırız.
        this.statusMapByOperationId.set(paymentDto.id, 'WAITING');
        if (paymentDto.type == "REFUND") {
            // 30 saniye sonra otomatik olarak ödemeyi tamamla.
            setTimeout(() => {
                if (this.statusMapByOperationId.get(paymentDto.id) === 'WAITING') {
                    this.setPaymentStatusAndRedirect(paymentDto.id, 'COMPLETED', '');
                }
            }, 30000);
        }
        return {
            paymentChannelId: 'dummy-ecommerce',
            paymentChannelOperationId: paymentDto.id,
            redirectUrl: `dummy-ecommerce-payment-channel/operation/${paymentDto.id}`,
            paymentStatus: 'WAITING',
            feeCutInstantly: true,
            providerFee: fee,
        } as PaymentChannelStatusDTO;
    }

    @Get('operation/:operationId')
    async getPaymentOperationDummyPage(
        @Param('operationId') operationId: string,
        @Query('redirectUrl') redirectUrlBackToApp: string,
        @Res() fastifyReply: FastifyReply,
    ) {
        fastifyReply.type('html').send(
            `<html>
            <body>
                <h1>Dummy Ecommerce Payment Page</h1>
                <p>Operation ID: ${operationId}</p>
                <p>This is a simulated payment page. In a real scenario, the user would complete the payment here.</p>
                <button onclick="completePayment()">Complete Payment</button>
                <button onclick="refusePayment()">Refuse Payment</button>
                <script>
                    const redirectUrlBackToApp = '${redirectUrlBackToApp}';
                    function completePayment() {
                        window.location.href = '${operationId}' + '/status/COMPLETED?redirectUrl=' + encodeURIComponent(redirectUrlBackToApp || "");
                    }
                    function refusePayment() {
                        window.location.href = '${operationId}' + '/status/EXPIRED?redirectUrl=' + encodeURIComponent(redirectUrlBackToApp || "");
                    }
                </script>
            </body>
        </html>`,
        );
    }

    @Get('/operation/:operationId/status/:set')
    async setPaymentStatusAndRedirect(
        @Param('operationId') operationId: string,
        @Param('set') set: 'COMPLETED' | 'FAILED',
        @Query('redirectUrl') redirectUrlBackToApp: string,
        @Res() fastifyReply?: FastifyReply,
    ) {
        this.statusMapByOperationId.set(operationId, set);
        this.kfk.emit(
            'postral/payment-operation-status-updated',
            operationId,
        );

        // TODO: belki redirect'i farklı yolla çözebiliriz... Sayfa olarak renderlatıp timeout ile yapacağım.

        // Redirect back to the application with status
        if (fastifyReply && redirectUrlBackToApp) {
            return fastifyReply.status(302).redirect(
                `${redirectUrlBackToApp}?operationId=${operationId}&status=${set}`,
            );
        } else {
            return {
                operationId,
                status: set,
            };
        }
    }

    @Get('/operation/:operationId/status')
    async checkPaymentStatusAndRedirect(
        @Param('operationId') operationId: string,
        @Query('redirectUrl') redirectUrlBackToApp: string,
        @Res() fastifyReply: FastifyReply,
    ) {
        let currentStatus = this.statusMapByOperationId.get(operationId);
        if (!currentStatus) {
            throw new Error('Operation not found');
        }

        // Simulate status change
        if (currentStatus === 'WAITING') {
            currentStatus = 'COMPLETED';
            this.statusMapByOperationId.set(operationId, currentStatus);
        }
        // Redirect back to the application with status
        return fastifyReply.status(302).redirect(
            `${redirectUrlBackToApp}?operationId=${operationId}&status=${currentStatus}`,
        );
    }
}
