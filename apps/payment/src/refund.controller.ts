import { Controller, Post, Body, Param, UseGuards, Req } from '@nestjs/common';
import { RefundService } from './service/refund.service';
import { CreateRefundRequestDTO, RefundRequestDTO } from '@tk-postral/payment-common';
import { UserAuthBackendDTO } from '@ubs-platform/users-common';
import { AuthGuard } from '@nestjs/passport'; // Assuming basic auth setup

@Controller('refund')
@UseGuards(AuthGuard('jwt')) // Assuming JWT is used in the project based on general patterns
export class RefundController {
    constructor(private readonly refundService: RefundService) {}

    @Post('request')
    async createRefundRequest(
        @Req() req: any,
        @Body() dto: CreateRefundRequestDTO,
    ): Promise<RefundRequestDTO> {
        const user: UserAuthBackendDTO = req.user;
        return this.refundService.createRefundRequest(user, dto);
    }

    @Post('request/:id/approve')
    async approveRefundRequest(
        @Req() req: any,
        @Param('id') id: string,
    ): Promise<RefundRequestDTO> {
        const user: UserAuthBackendDTO = req.user;
        return this.refundService.approveRefundRequest(user, id);
    }

    @Post('request/:id/reject')
    async rejectRefundRequest(
        @Req() req: any,
        @Param('id') id: string,
    ): Promise<RefundRequestDTO> {
        const user: UserAuthBackendDTO = req.user;
        return this.refundService.rejectRefundRequest(user, id);
    }
}
