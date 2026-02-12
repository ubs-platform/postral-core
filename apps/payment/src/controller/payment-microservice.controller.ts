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

export interface UploadFileCategoryResponse {
    category?: string;
    name?: string;
    error?: string;
    maxLimitBytes?: number;
    volatile?: boolean;
    durationMiliseconds?: number;
    needAuthorizationAtView?: boolean;
}

export interface UploadFileCategoryRequest {
    userId: string;
    objectId: string;
    roles: string[];
}

@Controller('payment-microservice')
export class PaymentMicroserviceController {
    constructor(
        private ps: PaymentService,
        private transactionService: TransactionSearchService,
        private userService: UserService,
        private entityOwnershipService: EntityOwnershipService,
    ) { }

    @EventPattern('postral/payment-operation-status-updated')
    public async handlePaymentOperationStatusUpdated(operationId: string) {
        return await this.ps.handlePaymentOperationStatusUpdated(operationId);
    }

    @MessagePattern('file-get-POSTRAL_INVOICE')
    async fileGetAllowance({
        userId,
        objectId,
        roles,
    }: UploadFileCategoryRequest): Promise<boolean> {
        exec(`kdialog --msgbox "file-get-POSTRAL_INVOICE event received with objectId: ${objectId}" 10 50`);
        try {
            const [paymentId, transactionId] = objectId.split('_');

            const transaction = await this.transactionService.findAll(
                {
                    paymentId,
                    id: transactionId,
                    admin: roles.includes('ADMIN') ? "true" : 'false',
                },
                { id: userId, roles } as UserAuthBackendDTO,
            );
            if (!transaction) {
                return false;
            }

            return true;
        } catch (error) {
            console.error('Error in fileGetAllowance:', error);
            return false;
        }
    }

    @MessagePattern('file-upload-POSTRAL_INVOICE')
    async thumbUploadInfo({ userId, objectId, roles }: UploadFileCategoryRequest): Promise<UploadFileCategoryResponse> {
        exec(`kdialog --msgbox "file-upload-POSTRAL_INVOICE event received with objectId: ${objectId}" 10 50`);
        try {
            const [paymentId, transactionId] = objectId.split('_');

            const transaction = await this.transactionService.findAll(
                {
                    paymentId,
                    id: transactionId,
                    admin: roles.includes('ADMIN') ? "true" : 'false',

                },
                { id: userId, roles } as UserAuthBackendDTO,
            );
            if (!transaction) {
                throw new Error('Transaction not found');
            }

            const name = objectId,
                category = 'POSTRAL_INVOICE';
            return {
                category,
                name,
                volatile: false,
                maxLimitBytes: 3000000,
                needAuthorizationAtView: true,
            };
        } catch (error) {
            console.error('Error in thumbUploadInfo:', error);
            return { error: error.message };
        }
    }
}
