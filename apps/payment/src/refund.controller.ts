import { Controller, Post, Body, Param, UseGuards, Req, Get, Query } from '@nestjs/common';
import { RefundService } from './service/refund.service';
import { CreateRefundRequestDTO, RefundRequestDTO, RefundRequestSearchDTO } from '@tk-postral/payment-common';
import { UserAuthBackendDTO } from '@ubs-platform/users-common';
import { AuthGuard } from '@nestjs/passport'; // Assuming basic auth setup
import { CurrentUser, JwtAuthGuard } from '@ubs-platform/users-microservice-helper';

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

    @Get('request/_search')
    @UseGuards(JwtAuthGuard)
    async searchRefundRequests(
        @Query() searchDTO: RefundRequestSearchDTO,
        @CurrentUser() user: UserAuthBackendDTO
    ) {
        // You could enforce seller account restrictions here if needed
        return this.refundService.searchRefundRequests(user, searchDTO);
    }

    @Get('request/:id')
    async getRefundRequestById(
        @Param('id') id: string
    ): Promise<RefundRequestDTO> {
        return this.refundService.getRefundRequestById(id);
    }
}
