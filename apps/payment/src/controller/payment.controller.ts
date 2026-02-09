import {
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
import { PaymentDTO, PaymentFullDTO, PaymentInitDTO } from '@tk-postral/payment-common';
import { AccountService } from '../service/account.service';
import { PaymentCaptureInfoDTO } from '@tk-postral/payment-common/dto/capture-info.dto';
import { EventPattern } from '@nestjs/microservices';

@Controller('payment')
export class PaymentController {
    constructor(
        private ps: PaymentService,
        private as: AccountService,
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
        return await this.ps.startPaymentOperation(id, captureInfo);
        //   return await this.ps.generateTransactions(id, captureInfo);
    }

    @Post('/:id/operation/check')
    public async checkOperation(@Param() { id }: { id: string }) {
        return await this.ps.updatePaymentByOperationStatuses(id);
        //   return await this.ps.generateTransactions(id, captureInfo);
    }

    @Get('/:id')
    public async fetchPaymentInformation(@Param() { id }: { id: string }) {
        return await this.ps.findPaymentById(id, false) as PaymentDTO;
    }


    @Get('/:id/full')
    public async fetchPaymentFull(@Param() { id }: { id: string }) {
        return await this.ps.findPaymentById(id, true) as PaymentFullDTO;
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

    @Sse('/:id/operation/stream')
    public async streamPaymentStatus(@Param() { id }: { id: string }) {
        return this.ps.streamPaymentStatus(id);
    }

    @EventPattern('postral/payment-operation-status-updated')
    public handlePaymentOperationStatusUpdated(operationId: string) {
        return this.ps.handlePaymentOperationStatusUpdated(operationId);
    }
}
