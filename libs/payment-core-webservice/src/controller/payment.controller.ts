import {
    BadRequestException,
    Body,
    Controller,
    Delete,
    Get,
    HttpException,
    NotFoundException,
    Param,
    Post,
    Req,
    Res,
    Sse,
    UseGuards,
} from '@nestjs/common';
import { PaymentService } from '../service/payment.service';
import {
    PaymentDTO,
    PaymentFullDTO,
    PaymentInitDTO,
    CreateExternalPlatformPaymentDTO,
} from '@tk-postral/payment-common';
import { AccountService } from '../service/account.service';
import { PaymentCaptureInfoDTO } from '@tk-postral/payment-common/dto/capture-info.dto';
import { EventPattern, MessagePattern } from '@nestjs/microservices';
import { filter } from 'rxjs';
import { PaymentChannelConfigService } from '../service/payment-channel-config.service';
import { exec } from 'child_process';
import { CurrentUser, JwtAuthGuard } from '@ubs-platform/users-microservice-helper';
import { UserAuthBackendDTO } from '@ubs-platform/users-common';
import { ExternalPlatformPaymentService } from '../service/external-platform-payment.service';
import { FastifyReply, FastifyRequest } from 'fastify';

const UUID_PATTERN = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

@Controller('payment')
export class PaymentController {
    constructor(
        private ps: PaymentService,
        private as: AccountService,
        private paymentChannelConfigService: PaymentChannelConfigService,
        private externalPlatformPayments: ExternalPlatformPaymentService,
    ) { }

    @Post()
    public async initialize(@Body() body: PaymentInitDTO) {
        await this.as.fetchOne(body.customerAccountId);
        return await this.ps.init(body);
    }

    @Post('external-platform')
    @UseGuards(JwtAuthGuard)
    public async createExternalPlatformPayment(
        @Body() body: CreateExternalPlatformPaymentDTO,
        @CurrentUser() user: UserAuthBackendDTO,
    ): Promise<PaymentDTO> {
        return this.externalPlatformPayments.createExternalPlatformPayment(body, user);
    }

    @Post('/:id/operation/start')
    public async startOperation(
        @Param() { id }: { id: string },
        @Body() captureInfo: PaymentCaptureInfoDTO,
        @Req() request: FastifyRequest,
    ) {
        let error: any = null;
        try {
            const isProduction = process.env.NODE_ENV === 'production';
            const paymentChList = await this.paymentChannelConfigService.fetchAll({ channelId: captureInfo.paymentChannelId, page: 0, size: 2 }, isProduction)
            if (!paymentChList.content?.length) {
                error = new BadRequestException("No payment channel found");
            }
            const paymentCh = paymentChList.content[0]
            if (!paymentCh.enabled) {
                error = new BadRequestException("Payment channel is not enabled");
            }
            if (paymentCh.devOnly && isProduction) {
                error = new BadRequestException("Payment channel is not available in production");
            }
            if (await this.ps.hasOngoingPaymentOperations(id)) {
                error = new BadRequestException("There are ongoing payment operations");
            }
            if (error) {
                await this.ps.failPaymentIfSetFailFieldTrue(id);
                throw error;
            }

            return await this.ps.startPaymentOperation(id, {
                ...captureInfo,
                buyerIp: request.ip,
            });
        } catch (error: any) {
            console.error(`Error starting payment operation for payment ${id}:`, error);
            try {
                await this.ps.failPaymentIfSetFailFieldTrue(id);
            } catch (failError) {
                console.error(`Error failing payment ${id} after failed operation start:`, failError);
            }
            if (error instanceof HttpException && error.getStatus() < 500) {
                throw error;
            }
            throw new BadRequestException(`Failed to start payment operation`);
        }
        //   return await this.ps.generateTransactions(id, captureInfo);
    }

    // Payment channels send the browser here instead of the frontend; see PaymentCaptureInfoDTO.redirectUrl.
    @Get('/operation/:operationId/return')
    public async returnFromOperation(
        @Param('operationId') operationId: string,
        @Res() reply: FastifyReply,
    ) {
        if (!UUID_PATTERN.test(operationId)) {
            throw new NotFoundException('Payment operation not found');
        }
        const target = await this.ps.resolveOperationReturnUrl(operationId);
        return reply
            .header('Cache-Control', 'no-store')
            .header('Referrer-Policy', 'no-referrer')
            .redirect(target, 302);
    }

    @Post('/:id/operation/check')
    public async checkOperation(@Param() { id }: { id: string }) {
        // exec(`kdialog --msg "Checking payment operation for payment ${id}"`);
        return await this.ps.updatePaymentByOperationStatuses(id);
        //   return await this.ps.generateTransactions(id, captureInfo);
    }

    @Get('/:id')
    public async fetchPaymentInformation(@Param() { id }: { id: string }) {
        return (await this.ps.findPaymentById(id, false)) as PaymentDTO;
    }

    @Get('/:id/full')
    public async fetchPaymentFull(@Param() { id }: { id: string }) {
        return (await this.ps.findPaymentById(id, true)) as PaymentFullDTO;
    }

    @Get('/:id/item')
    public async fetchItems(@Param() { id }: { id: string }) {
        return await this.ps.findItems(id);
    }

    @Get('/:id/tax')
    public async fetchTaxes(@Param() { id }: { id: string }) {
        return await this.ps.findTaxes(id);
    }

    @Delete('/:id')
    public async cancelPayment(@Param() { id }: { id: string }) {
        const payment = await this.ps.findPaymentById(id);
        if (!payment) {
            throw new NotFoundException(`Payment with id ${id} not found`);
        }
        return await this.ps.cancelPayment(id);
    }

    @Post('/:id/confirm')
    public async confirmOpenPayment(
        @Param() { id }: { id: string },
        @Body() body: { sellerAccountId: string },
    ) {
        return await this.ps.confirmOpenPayment(id, body.sellerAccountId);
    }

    @Sse('/:id/operation/stream')
    public async streamPaymentStatus(@Param() { id }: { id: string }) {
        return this.ps.paymentStream.pipe(filter((p) => p.id === id));
    }


}
