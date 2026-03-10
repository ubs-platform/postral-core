import {
    BadRequestException,
    ForbiddenException,
    Injectable,
    NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { RefundRequest } from '../entity/refund-request.entity';
import { RefundRequestItem } from '../entity/refund-request-item.entity';
import { Payment } from '../entity/payment.entity';
import { PostralPaymentItem } from '../entity/payment-item.entity';
import { PaymentService } from './payment.service';
import { AuthUtilService } from './auth-util.service';
import {
    CreateRefundRequestDTO,
    RefundRequestDTO,
    RefundRequestSearchDTO,
} from '@tk-postral/payment-common';
import { PostralConstants } from '../util/consts';
import { UserAuthBackendDTO } from '@ubs-platform/users-common';
import { EventSenderService } from './event-management.service';
import { RawSearchResult } from '@ubs-platform/crud-base-common';
import { TypeormSearchUtil } from './base/typeorm-search-util';

@Injectable()
export class RefundService {
    constructor(
        @InjectRepository(RefundRequest)
        private readonly refundRequestRepo: Repository<RefundRequest>,
        @InjectRepository(RefundRequestItem)
        private readonly refundRequestItemRepo: Repository<RefundRequestItem>,
        @InjectRepository(Payment)
        private readonly paymentRepo: Repository<Payment>,
        @InjectRepository(PostralPaymentItem)
        private readonly paymentItemRepo: Repository<PostralPaymentItem>,
        private readonly paymentService: PaymentService,
        private readonly authUtilService: AuthUtilService,
        private readonly eventSenderService: EventSenderService,
    ) {}

    async createRefundRequest(
        user: UserAuthBackendDTO,
        dto: CreateRefundRequestDTO,
    ): Promise<RefundRequestDTO> {
        const payment = await this.paymentRepo.findOne({
            where: { id: dto.paymentId },
            relations: ['items'],
        });

        if (!payment) {
            throw new NotFoundException('Payment not found');
        }

        if (payment.paymentStatus !== 'COMPLETED') {
            throw new BadRequestException('Can only refund completed payments');
        }

        // Validate items and refund counts
        for (const reqItem of dto.items) {
            const paymentItem = payment.items.find(
                (i) => i.id === reqItem.paymentItemId,
            );
            if (!paymentItem) {
                throw new BadRequestException(
                    `Payment item ${reqItem.paymentItemId} not found in this payment`,
                );
            }
            if (
                paymentItem.refundCount + reqItem.refundCount >
                paymentItem.quantity
            ) {
                throw new BadRequestException(
                    `Cannot refund more than purchased quantity for item ${paymentItem.name}`,
                );
            }
        }

        const request = new RefundRequest();
        request.paymentId = dto.paymentId;
        request.requestedByAccountId = user.id; // Or customer account id if appropriate
        request.status = 'PENDING';

        request.items = dto.items.map((i) => {
            const originalItem = payment.items.find(
                (paymentItem) => paymentItem.id === i.paymentItemId,
            );

            if (!originalItem) {
                throw new BadRequestException(
                    `Payment item ${i.paymentItemId} not found in this payment`,
                );
            }

            const item = new RefundRequestItem();
            item.paymentItemId = i.paymentItemId;
            item.refundCount = i.refundCount;
            item.itemName = originalItem.name;

            const perUnitWithoutTax =
                originalItem.quantity > 0
                    ? originalItem.unTaxAmount / originalItem.quantity
                    : 0;

            item.unitAmount = originalItem.unitAmount;
            item.unitAmountWithoutTax = perUnitWithoutTax;
            item.refundAmount = originalItem.unitAmount * i.refundCount;
            item.refundAmountWithoutTax = perUnitWithoutTax * i.refundCount;
            item.refundTaxAmount =
                item.refundAmount - item.refundAmountWithoutTax;
            return item;
        });

        const savedRequest = await this.refundRequestRepo.save(request);
        return this.mapToDTO(savedRequest);
    }

    async approveRefundRequest(
        user: UserAuthBackendDTO,
        requestId: string,
    ): Promise<RefundRequestDTO> {
        const request = await this.refundRequestRepo.findOne({
            where: { id: requestId },
            relations: ['items'],
        });

        if (!request) {
            throw new NotFoundException('Refund request not found');
        }

        if (request.status !== 'PENDING') {
            throw new BadRequestException(
                'Refund request is not in PENDING state',
            );
        }

        const payment = await this.paymentRepo.findOne({
            where: { id: request.paymentId },
            relations: ['items'],
        });

        if (!payment) {
            throw new NotFoundException(
                'Payment associated with request not found',
            );
        }

        // Verify Roles
        const sellerAccountIds = payment.items.map((i) => i.sellerAccountId);
        const uniqueSellerIds = [...new Set(sellerAccountIds)];

        const ownedSellerIds = await this.authUtilService.searchOwnedIds(
            PostralConstants.ENTITY_NAME_ACCOUNT,
            ['OWNER', 'EDITOR'],
            { userId: user.id },
        );

        if (!ownedSellerIds) {
            throw new ForbiddenException(
                'User is not authorized to approve this refund',
            );
        }

        const isAuthorizedToApproveAll = uniqueSellerIds.every((id) =>
            ownedSellerIds.includes(id),
        );

        if (!isAuthorizedToApproveAll) {
            throw new ForbiddenException(
                'User does not have EDITOR or OWNER rights for the relevant seller accounts',
            );
        }

        // Create the Refund Payment
        const refundInitPayload = {
            type: 'REFUND' as any, // 'REFUND'
            currency: payment.currency,
            customerAccountId: payment.customerAccountId,
            items: request.items.map((reqItem) => {
                const originalItem = payment.items.find(
                    (i) => i.id === reqItem.paymentItemId,
                );
                if (!originalItem) {
                    throw new NotFoundException(
                        `Original item not found for refund item ${reqItem.id}`,
                    );
                }
                const mappedItem: any = {
                    itemId: originalItem.itemId,
                    quantity: reqItem.refundCount,
                    unitAmount: originalItem.unitAmount,
                    originalUnitAmount: originalItem.originalUnitAmount,
                    taxPercent: originalItem.taxPercent,
                    variation: originalItem.variation,
                    entityGroup: originalItem.entityGroup,
                    entityId: originalItem.entityId,
                    entityName: originalItem.entityName,
                    sellerAccountId: originalItem.sellerAccountId,
                    sellerAccountName: originalItem.sellerAccountName,
                    unit: originalItem.unit,
                    name: originalItem.name,
                };
                return mappedItem;
            }),
            refundPaymentId: payment.id, // Linking back to original purchase payment ID
            saleMode: 'DEFAULT',
        };

        if (payment.paymentChannelId && payment.paymentChannelOperationId) {
            await this.eventSenderService.paymentChannelRefund(
                payment.paymentChannelId,
                payment.paymentChannelOperationId,
            );
        }

        await this.paymentService.init(refundInitPayload);

        // Update Original Items refundCount
        for (const reqItem of request.items) {
            const originalItem = payment.items.find(
                (i) => i.id === reqItem.paymentItemId,
            );
            if (originalItem) {
                originalItem.refundCount += reqItem.refundCount;
                if (originalItem.refundCount >= originalItem.quantity) {
                    originalItem.refunded = true;
                }
                await this.paymentItemRepo.save(
                    originalItem as PostralPaymentItem,
                );
            }
        }

        request.status = 'APPROVED';
        request.resolvedByAccountId = user.id;
        const savedRequest = await this.refundRequestRepo.save(request);
        return this.mapToDTO(savedRequest);
    }

    async rejectRefundRequest(
        user: UserAuthBackendDTO,
        requestId: string,
    ): Promise<RefundRequestDTO> {
        const request = await this.refundRequestRepo.findOne({
            where: { id: requestId },
            relations: ['items'],
        });

        if (!request) {
            throw new NotFoundException('Refund request not found');
        }

        if (request.status !== 'PENDING') {
            throw new BadRequestException(
                'Refund request is not in PENDING state',
            );
        }

        // Role verification (Same as approve)
        const payment = await this.paymentRepo.findOne({
            where: { id: request.paymentId },
            relations: ['items'],
        });

        if (!payment) {
            throw new NotFoundException(
                'Payment associated with request not found',
            );
        }

        const sellerAccountIds = payment.items.map((i) => i.sellerAccountId);
        const uniqueSellerIds = [...new Set(sellerAccountIds)];

        const ownedSellerIds = await this.authUtilService.searchOwnedIds(
            PostralConstants.ENTITY_NAME_ACCOUNT,
            ['OWNER', 'EDITOR'],
            { userId: user.id },
        );

        if (!ownedSellerIds) {
            throw new ForbiddenException(
                'User is not authorized to reject this refund',
            );
        }

        const isAuthorizedToApproveAll = uniqueSellerIds.every((id) =>
            ownedSellerIds.includes(id),
        );

        if (!isAuthorizedToApproveAll) {
            throw new ForbiddenException(
                'User does not have EDITOR or OWNER rights for the relevant seller accounts',
            );
        }

        request.status = 'REJECTED';
        request.resolvedByAccountId = user.id;
        const savedRequest = await this.refundRequestRepo.save(request);
        return this.mapToDTO(savedRequest);
    }

    private mapToDTO(entity: RefundRequest): RefundRequestDTO {
        return {
            id: entity.id,
            paymentId: entity.paymentId,
            status: entity.status,
            requestedByAccountId: entity.requestedByAccountId,
            resolvedByAccountId: entity.resolvedByAccountId,
            createdAt: entity.createdAt,
            updatedAt: entity.updatedAt,
            items:
                entity.items?.map((i) => ({
                    id: i.id,
                    paymentItemId: i.paymentItemId,
                    refundCount: i.refundCount,
                    itemName: i.itemName,
                    unitAmount: i.unitAmount,
                    unitAmountWithoutTax: i.unitAmountWithoutTax,
                    refundAmount: i.refundAmount,
                    refundAmountWithoutTax: i.refundAmountWithoutTax,
                    refundTaxAmount: i.refundTaxAmount,
                })) || [],
        };
    }

    async searchRefundRequests(
        searchParams: RefundRequestSearchDTO,
    ): Promise<RawSearchResult<RefundRequestDTO>> {
        const query = {}

        // if (searchParams.status) {
        //     query.andWhere('request.status = :status', {
        //         status: searchParams.status,
        //     });
        // }

        // if (searchParams.paymentId) {
        //     query.andWhere('request.paymentId = :paymentId', {
        //         paymentId: searchParams.paymentId,
        //     });
        // }

        return (await TypeormSearchUtil.modelSearch<RefundRequestDTO>(
            this.refundRequestRepo,
            searchParams.size,
            searchParams.page,
            {},
            ['items'],
            query,
        )).map((result) => ({
            ...result,
        }));
    }

    async getRefundRequestById(id: string): Promise<RefundRequestDTO> {
        const request = await this.refundRequestRepo.findOne({
            where: { id },
            relations: ['items'],
        });

        if (!request) {
            throw new NotFoundException(
                `RefundRequest with id ${id} not found`,
            );
        }

        return this.mapToDTO(request);
    }
}
