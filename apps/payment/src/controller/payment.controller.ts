import { Body, Controller, Get, NotFoundException, Param, Post } from '@nestjs/common';
import { PaymentService } from '../service/payment.service';
import { PaymentInitDTO } from '@tk-postral/payment-common';
import { AccountService } from '../service/account.service';
import { PaymentCaptureInfoDTO } from '@tk-postral/payment-common/dto/capture-info.dto';

@Controller('payment')
export class PaymentController {
    constructor(private ps: PaymentService, private as: AccountService) { }

    @Post()
    public async initialize(@Body() body: PaymentInitDTO) {
        await this.as.fetchOne(body.customerAccountId)
        return await this.ps.init(body);
    }

    @Post('/:id/operation/start')
    public async capture(@Param() { id }: { id: string }, @Body() captureInfo : PaymentCaptureInfoDTO) {
        
    //   return await this.ps.generateTransactions(id, captureInfo);
    }


    @Post('/:id/operation/check')
    public async checkIsItPaid(@Param() { id }: { id: string }, @Body() captureInfo : PaymentCaptureInfoDTO) {
    //   return await this.ps.generateTransactions(id, captureInfo);
    }

    @Get()
    public async fetchAll() {
        return await this.ps.findAll();
    }

    @Get('/:id')
    public async fetchPaymentInformation(@Param() { id }: { id: string }) {
        return await this.ps.findPaymentById(id);
    }

    @Get('/:id/item')
    public async fetchItems(@Param() { id }: { id: string }) {
        return await this.ps.findItems(id);
    }

    @Get('/:id/tax')
    public async fetchTaxes(@Param() { id }: { id: string }) {
        return await this.ps.findTaxes(id);
    }
}
