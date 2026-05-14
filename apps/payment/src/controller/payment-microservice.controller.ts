import { Controller } from '@nestjs/common';
import { PaymentService } from '../service/payment.service';
import { EventPattern, MessagePattern } from '@nestjs/microservices';
import { SellerPaymentOrderService } from '../service/transaction.service';
import { SellerPaymentOrderSearchService } from '../service/transaction-search.service';
import {
    EntityOwnershipService,
    UserService,
} from '@ubs-platform/users-microservice-helper';
import { UserAuthBackendDTO } from '@ubs-platform/users-common';
import {
    ENTITY_GROUP_POSTRAL,
    ENTITY_NAME_POSTRAL_ACCOUNT,
} from '@tk-postral/payment-common/util/consts';
import { lastValueFrom } from 'rxjs';
import { exec } from 'child_process';
import { ReportDigestionService } from '../service/report-digestion.service';

@Controller('payment-microservice')
export class PaymentMicroserviceController {
    constructor(
        private ps: PaymentService,
        private transactionService: SellerPaymentOrderSearchService,
        private paymentTransactionService: SellerPaymentOrderService,
        private userService: UserService,
        private entityOwnershipService: EntityOwnershipService,
        private paymentService: PaymentService,
        private reportDigestionService: ReportDigestionService,
    ) { }

    @EventPattern('postral/payment-operation-status-updated')
    public async handlePaymentOperationStatusUpdated(operationId: string) {
        return await this.ps.handlePaymentOperationStatusUpdated(operationId);
    }

    @EventPattern('postral/invoice-updated')
    public async handleInvoiceUpdated(data: {
        sellerPaymentOrderId: string;
        invoiceCount: number;
        hasFinalizedInvoice: boolean;
    }) {
        await this.paymentTransactionService.updateInvoiceStatus(
            data.sellerPaymentOrderId,
            data.invoiceCount,
            data.hasFinalizedInvoice,
        );
    }

    @EventPattern('postral/report-digestion-queue-insertion')
    public async handleReportDigestionQueueInsertion({paymentId}: {paymentId: string}) {
        const paymentFullDTO = await this.paymentService.findPaymentById(paymentId, true);
        return await this.reportDigestionService.insertPaymentToReportDigestionQueueCameFromEvent(paymentFullDTO);
    }
}
