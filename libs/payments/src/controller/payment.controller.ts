import { Body, Controller, Get, Param, Post } from '@nestjs/common';
import { PaymentService } from '../service/payment-service';
import { PaymentInitDTO } from '../dto/payment-init.dto';

@Controller('payment')
export class PaymentController {
    constructor(private ps: PaymentService) {}

    @Post()
    public async initialize(@Body() body: PaymentInitDTO) {
        return await this.ps.init(body);
    }

    @Post('/:id/capture')
    public async capture(@Param() { id }: { id: string }, @Body() captureInfo) {
        // return await this.ps.init(body);
    }

    @Get()
    public async fetchAll() {
        return await this.ps.findAll();
    }
    @Get('/:id/items')
    public async fetchItems(@Param() { id }: { id: string }) {
        return await this.ps.findItems(id);
    }
}
