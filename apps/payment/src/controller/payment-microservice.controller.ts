import { Controller } from '@nestjs/common';
import { PaymentService } from '../service/payment.service';
import { EventPattern, MessagePattern } from '@nestjs/microservices';
import { PaymentTransactionService } from '../service/transaction.service';
import { TransactionSearchService } from '../service/transaction-search.service';
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

@Controller('payment-microservice')
export class PaymentMicroserviceController {
    constructor(
        private ps: PaymentService,
        private transactionService: TransactionSearchService,
        private paymentTransactionService: PaymentTransactionService,
        private userService: UserService,
        private entityOwnershipService: EntityOwnershipService,
    ) {}

    @EventPattern('postral/payment-operation-status-updated')
    public async handlePaymentOperationStatusUpdated(operationId: string) {
        return await this.ps.handlePaymentOperationStatusUpdated(operationId);
    }

    @EventPattern('POSTRAL_INVOICE_UPDATED')
    public async handleInvoiceUpdated(data: {
        transactionId: string;
        invoiceCount: number;
        hasFinalizedInvoice: boolean;
    }) {
        await this.paymentTransactionService.updateInvoiceStatus(
            data.transactionId,
            data.invoiceCount,
            data.hasFinalizedInvoice,
        );
    }
}
