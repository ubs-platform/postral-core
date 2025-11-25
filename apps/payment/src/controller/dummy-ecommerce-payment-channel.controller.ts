import { Controller, Get, Param, Post, Query, Redirect } from '@nestjs/common';
import { MessagePattern } from '@nestjs/microservices';
import { PaymentDTO, PaymentFullDTO } from '@tk-postral/payment-common';

@Controller('dummy-ecommerce-payment-channel')
export class DummyEcommercePaymentChannelController {
    // This is a dummy controller for ecommerce payment channel simulation

    readonly statusMapByOperationId: Map<
        string,
        'INITIATED' | 'COMPLETED' | 'WAITING' | 'EXPIRED'
    > = new Map();

    @MessagePattern('postral/payment-channel/dummy-ecommerce/start')
    async handleStartPaymentOperation(paymentDto: PaymentFullDTO) {
        this.statusMapByOperationId.set(paymentDto.id, 'WAITING');
        return {
            operationId: paymentDto.id,
            redirectUrl: `dummy-ecommerce-payment-channel/pay/${paymentDto.id}`,
        };
    }

    @MessagePattern('postral/payment-channel/dummy-ecommerce/check')
    async checkPayment(paymentOperationId: string) {
        return this.statusMapByOperationId.get(paymentOperationId);
    }

    @Post('/operation')
    async startPaymentOperation(operationId: string) {
        this.statusMapByOperationId.set(operationId, 'WAITING');
        return {
            operationId: operationId,
            redirectUrl: `dummy-ecommerce-payment-channel/pay/${operationId}`,
        };
    }

    @Get('operation/:operationId')
    async getPaymentOperationDummyPage(
        @Param('operationId') operationId: string,
        @Query('redirectUrl') redirectUrlBackToApp: string,
    ) {
        // This would normally return an HTML page for the dummy ecommerce payment
        return `<html>
            <body>
                <h1>Dummy Ecommerce Payment Page</h1>
                <p>Operation ID: ${operationId}</p>
                <p>This is a simulated payment page. In a real scenario, the user would complete the payment here.</p>
                <button onclick="completePayment()">Complete Payment</button>
                <button onclick="refusePayment()">Refuse Payment</button>
                <script>
                    function completePayment() {
                        window.location.href = '/dummy-ecommerce-payment-channel/operation/${operationId}/status/COMPLETED?redirectUrl=${redirectUrlBackToApp}';
                    }
                    function refusePayment() {
                        window.location.href = '/dummy-ecommerce-payment-channel/operation/${operationId}/status/EXPIRED?redirectUrl=${redirectUrlBackToApp}';
                    }
                </script>
            </body>
        </html>`;
    }

    @Post('/operation/:operationId/status/:set')
    async setPaymentStatusAndRedirect(
        @Param('operationId') operationId: string,
        @Param('set') set: 'COMPLETED' | 'EXPIRED',
        @Query('redirectUrl') redirectUrlBackToApp: string,
    ) {
        this.statusMapByOperationId.set(operationId, set);
        // Redirect back to the application with status
        return Redirect(
            `${redirectUrlBackToApp}?operationId=${operationId}&status=${set}`,
        );
    }

    @Get('/operation/:operationId/status')
    async checkPaymentStatusAndRedirect(
        @Param('operationId') operationId: string,
        @Query('redirectUrl') redirectUrlBackToApp: string,
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
        return Redirect(
            `${redirectUrlBackToApp}?operationId=${operationId}&status=${currentStatus}`,
        );
    }
}
