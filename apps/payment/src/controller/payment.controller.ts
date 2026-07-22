import {
    BadRequestException,
    Body,
    Controller,
    Delete,
    Get,
    NotFoundException,
    Param,
    Post,
    Sse,
} from '@nestjs/common';
import { PaymentService } from '../service/payment.service';
import {
    PaymentDTO,
    PaymentFullDTO,
    PaymentInitDTO,
} from '@tk-postral/payment-common';
import { AccountService } from '../service/account.service';
import { PaymentCaptureInfoDTO } from '@tk-postral/payment-common/dto/capture-info.dto';
import { EventPattern, MessagePattern } from '@nestjs/microservices';
import { filter } from 'rxjs';
import { PaymentChannelConfigService } from '../service/payment-channel-config.service';
@Controller('payment')
export class PaymentController {
    constructor(
        private ps: PaymentService,
        private as: AccountService,
        private paymentChannelConfigService: PaymentChannelConfigService
    ) { }

    @Post()
    public async initialize(@Body() body: PaymentInitDTO) {
        await this.as.fetchOne(body.customerAccountId);
        return await this.ps.init(body);
    }

    @Post('/:id/operation/start')
    public async startOperation(
        @Param() { id }: { id: string },
        @Body() captureInfo: PaymentCaptureInfoDTO,
    ) {
        try {
            const isProduction = process.env.NODE_ENV === 'production';
            const paymentChList = await this.paymentChannelConfigService.fetchAll({ channelId: captureInfo.paymentChannelId, page: 0, size: 2 }, isProduction)
            if (!paymentChList.content?.length) {
                throw new BadRequestException("No payment channel found")
            }
            const paymentCh = paymentChList.content[0]
            if (!paymentCh.enabled) {
                throw new BadRequestException("Payment channel is not enabled")
            }
            if (paymentCh.devOnly && isProduction) {
                throw new BadRequestException("Payment channel is not available in production")
            }
            if (await this.ps.hasOngoingPaymentOperations(id)) {
                throw new BadRequestException("There are ongoing payment operations");
            }
            return await this.ps.startPaymentOperation(id, captureInfo);
        } catch (error) {
            console.error(`Error starting payment operation for payment ${id}:`, error);
            throw new BadRequestException(`Failed to start payment operation`);
        }

        //   return await this.ps.generateTransactions(id, captureInfo);
    }

    @Post('/:id/operation/check')
    public async checkOperation(@Param() { id }: { id: string }) {
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
