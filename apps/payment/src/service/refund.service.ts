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
    PaymentInitDTO,
    RefundRequestDTO,
    RefundRequestSearchDTO,
} from '@tk-postral/payment-common';
import { PostralConstants } from '../util/consts';
import { UserAuthBackendDTO } from '@ubs-platform/users-common';
import { EventSenderService } from './event-management.service';
import { RawSearchResult } from '@ubs-platform/crud-base-common';
import { TypeormSearchUtil } from './base/typeorm-search-util';
import { RefundRequestStatus } from '../entity/refund-request.entity';

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
    ) { }

    async createRefundRequest(
        user: UserAuthBackendDTO,
        dto: CreateRefundRequestDTO,
    ): Promise<RefundRequestDTO> {
        const payment = await this.findPaymentWithItems(dto.paymentId);
        this.assertPaymentIsRefundable(payment);
        this.validateRefundItems(payment, dto.items);
        this.assertRefundItemsBelongToSingleSeller(payment, dto.items);

        const request = this.buildRefundRequestEntity(user, dto, payment);

        const savedRequest = await this.refundRequestRepo.save(request);
        return this.mapToDTO(savedRequest);
    }

    async approveRefundRequest(
        user: UserAuthBackendDTO,
        requestId: string,
    ): Promise<RefundRequestDTO> {
        const { request, payment } =
            await this.loadPendingRefundRequestWithPayment(requestId);

        await this.authorizeRefundAction(user, payment, 'approve');
        this.assertRefundRequestItemsBelongToSingleSeller(payment, request.items);
        await this.triggerPaymentChannelRefund(payment);
        await this.paymentService.init(
            this.buildRefundPaymentInitPayload(payment, request),
        );
        await this.updateOriginalItemsRefundState(payment, request.items);

        return this.resolveRefundRequest(request, user, 'APPROVED');
    }

    async rejectRefundRequest(
        user: UserAuthBackendDTO,
        requestId: string,
    ): Promise<RefundRequestDTO> {
        const { request, payment } =
            await this.loadPendingRefundRequestWithPayment(requestId);

        await this.authorizeRefundAction(user, payment, 'reject');

        return this.resolveRefundRequest(request, user, 'REJECTED');
    }

    private async findPaymentWithItems(
        paymentId: string,
        notFoundMessage = 'Payment not found',
    ): Promise<Payment> {
        const payment = await this.paymentRepo.findOne({
            where: { id: paymentId },
            relations: ['items'],
        });

        if (!payment) {
            throw new NotFoundException(notFoundMessage);
        }

        return payment;
    }

    private async findRefundRequestWithItems(
        requestId: string,
    ): Promise<RefundRequest> {
        const request = await this.refundRequestRepo.findOne({
            where: { id: requestId },
            relations: ['items'],
        });

        if (!request) {
            throw new NotFoundException('Refund request not found');
        }

        return request;
    }

    private assertPaymentIsRefundable(payment: Payment): void {
        if (payment.paymentStatus !== 'COMPLETED') {
            throw new BadRequestException('Can only refund completed payments');
        }
    }

    private assertPendingRefundRequest(request: RefundRequest): void {
        if (request.status !== 'PENDING') {
            throw new BadRequestException(
                'Refund request is not in PENDING state',
            );
        }
    }

    private getPaymentItemOrThrow(
        payment: Payment,
        paymentItemId: string,
        notFoundMessage: string,
    ): PostralPaymentItem {
        const paymentItem = payment.items.find((item) => item.id === paymentItemId);

        if (!paymentItem) {
            throw new NotFoundException(notFoundMessage);
        }

        return paymentItem;
    }

    private validateRefundItems(
        payment: Payment,
        items: CreateRefundRequestDTO['items'],
    ): void {
        for (const requestItem of items) {
            const paymentItem = this.getPaymentItemForRefundRequest(
                payment,
                requestItem.paymentItemId,
            );

            if (paymentItem.refundCount + requestItem.refundCount > paymentItem.quantity) {
                throw new BadRequestException(
                    `Cannot refund more than purchased quantity for item ${paymentItem.name}`,
                );
            }
        }
    }

    private getPaymentItemForRefundRequest(
        payment: Payment,
        paymentItemId: string,
    ): PostralPaymentItem {
        return this.getPaymentItemOrThrow(
            payment,
            paymentItemId,
            `Payment item ${paymentItemId} not found in this payment`,
        );
    }

    private assertRefundItemsBelongToSingleSeller(
        payment: Payment,
        items: CreateRefundRequestDTO['items'],
    ): void {
        const sellerAccountIds = new Set(
            items.map(
                (requestItem) =>
                    this.getPaymentItemForRefundRequest(
                        payment,
                        requestItem.paymentItemId,
                    ).sellerAccountId,
            ),
        );

        if (sellerAccountIds.size > 1) {
            throw new BadRequestException(
                'Refund items must belong to the same seller account. Create separate refund requests for each seller.',
            );
        }
    }

    private assertRefundRequestItemsBelongToSingleSeller(
        payment: Payment,
        items: RefundRequestItem[],
    ): void {
        const sellerAccountIds = new Set(
            items.map(
                (requestItem) =>
                    this.getPaymentItemForRefundRequest(
                        payment,
                        requestItem.paymentItemId,
                    ).sellerAccountId,
            ),
        );

        if (sellerAccountIds.size > 1) {
            throw new BadRequestException(
                'Refund items must belong to the same seller account. Create separate refund requests for each seller.',
            );
        }
    }

    private buildRefundRequestEntity(
        user: UserAuthBackendDTO,
        dto: CreateRefundRequestDTO,
        payment: Payment,
    ): RefundRequest {
        const request = new RefundRequest();
        request.paymentId = dto.paymentId;
        request.requestedByAccountId = user.id;
        request.status = 'PENDING';
        request.items = this.buildRefundRequestItems(payment, dto.items);
        return request;
    }

    private buildRefundRequestItems(
        payment: Payment,
        items: CreateRefundRequestDTO['items'],
    ): RefundRequestItem[] {
        return items.map((requestItem) => {
            const originalItem = this.getPaymentItemForRefundRequest(
                payment,
                requestItem.paymentItemId,
            );
            const refundItem = new RefundRequestItem();
            const unitAmountWithoutTax =
                originalItem.quantity > 0
                    ? originalItem.unTaxAmount / originalItem.quantity
                    : 0;
            refundItem.variation = originalItem.variation;
            refundItem.paymentItemId = requestItem.paymentItemId;
            refundItem.refundCount = requestItem.refundCount;
            refundItem.itemName = originalItem.name;
            refundItem.unitAmount = originalItem.unitAmount;
            refundItem.unitAmountWithoutTax = unitAmountWithoutTax;
            refundItem.refundAmount =
                originalItem.unitAmount * requestItem.refundCount;
            refundItem.refundAmountWithoutTax =
                unitAmountWithoutTax * requestItem.refundCount;
            refundItem.refundTaxAmount =
                refundItem.refundAmount - refundItem.refundAmountWithoutTax;

            return refundItem;
        });
    }

    private async loadPendingRefundRequestWithPayment(
        requestId: string,
    ): Promise<{ request: RefundRequest; payment: Payment }> {
        const request = await this.findRefundRequestWithItems(requestId);
        this.assertPendingRefundRequest(request);

        const payment = await this.findPaymentWithItems(
            request.paymentId,
            'Payment associated with request not found',
        );

        return { request, payment };
    }

    private async authorizeRefundAction(
        user: UserAuthBackendDTO,
        payment: Payment,
        action: 'approve' | 'reject',
    ): Promise<void> {
        const sellerAccountIds = this.getUniqueSellerIds(payment);
        const ownedSellerIds = await this.authUtilService.searchOwnedIds(
            PostralConstants.ENTITY_NAME_ACCOUNT,
            ['OWNER', 'EDITOR'],
            { userId: user.id },
        );

        if (!ownedSellerIds) {
            throw new ForbiddenException(
                `User is not authorized to ${action} this refund`,
            );
        }

        const isAuthorizedForAllSellers = sellerAccountIds.every((id) =>
            ownedSellerIds.includes(id),
        );

        if (!isAuthorizedForAllSellers) {
            throw new ForbiddenException(
                'User does not have EDITOR or OWNER rights for the relevant seller accounts',
            );
        }
    }

    private getUniqueSellerIds(payment: Payment): string[] {
        return [...new Set(payment.items.map((item) => item.sellerAccountId))];
    }

    private buildRefundPaymentInitPayload(
        payment: Payment,
        request: RefundRequest,
    ): PaymentInitDTO {
        return {
            type: 'REFUND',
            currency: payment.currency,
            customerAccountId: payment.customerAccountId,
            items: request.items.map((requestItem) =>
                this.mapRefundPaymentItem(payment, requestItem),
            ),
            refundPaymentId: payment.id,
            saleMode: 'DEFAULT',
        };
    }

    private mapRefundPaymentItem(
        payment: Payment,
        requestItem: RefundRequestItem,
    ) {
        const originalItem = this.getPaymentItemOrThrow(
            payment,
            requestItem.paymentItemId,
            `Original item not found for refund item ${requestItem.id}`,
        );

        return {
            itemId: originalItem.itemId,
            quantity: requestItem.refundCount,
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
    }

    private async triggerPaymentChannelRefund(payment: Payment): Promise<void> {
        if (payment.paymentChannelId && payment.paymentChannelOperationId) {
            await this.eventSenderService.paymentChannelRefund(
                payment.paymentChannelId,
                payment.paymentChannelOperationId,
            );
        }
    }

    private async updateOriginalItemsRefundState(
        payment: Payment,
        requestItems: RefundRequestItem[],
    ): Promise<void> {
        for (const requestItem of requestItems) {
            const originalItem = this.getPaymentItemForRefundRequest(
                payment,
                requestItem.paymentItemId,
            );

            originalItem.refundCount += requestItem.refundCount;
            if (originalItem.refundCount >= originalItem.quantity) {
                originalItem.refunded = true;
            }

            await this.paymentItemRepo.save(originalItem);
        }
    }

    private async resolveRefundRequest(
        request: RefundRequest,
        user: UserAuthBackendDTO,
        status: RefundRequestStatus,
    ): Promise<RefundRequestDTO> {
        request.status = status;
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
                    variation: i.variation,
                })) || [],
        };
    }

    async searchRefundRequests(
        searchParams: RefundRequestSearchDTO,
    ): Promise<RawSearchResult<RefundRequestDTO>> {
        const query = {};

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
