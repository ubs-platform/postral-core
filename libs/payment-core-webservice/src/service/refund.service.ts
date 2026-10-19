import {
    BadRequestException,
    ConflictException,
    ForbiddenException,
    Injectable,
    NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { EntityManager, In, Repository } from 'typeorm';
import { RefundRequest, RefundRequestItem, Payment, PostralPaymentItem } from '@tk-postral/postral-entities';
import { PaymentService } from './payment.service';
import { AuthUtilService } from './auth-util.service';
import {
    CreateRefundRequestDTO,
    StartSystemRefundDTO,
    RefundRequestDTO,
    RefundRequestSearchDTO,RefundRequestStatus
    ,REFUND_REASON_KEYS, ResolveRefundRequestDTO
} from '@tk-postral/payment-common';
import { PostralConstants } from '../util/consts';
import { Capability, UserAuthBackendDTO } from '@ubs-platform/users-common';
import { EventSenderService } from './event-management.service';
import { RawSearchResult } from '@ubs-platform/crud-base-common';
import { TypeormSearchUtil } from './base/typeorm-search-util';

import { AmountCalculationUtil } from '@tk-postral/common-utils';
import Big from 'big.js';
import { randomUUID } from 'crypto';

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

    async startRefundMicroservice(dto: StartSystemRefundDTO): Promise<RefundRequestDTO> {
        if (typeof dto?.idempotencyKey !== 'string' || !dto.idempotencyKey.trim() || dto.idempotencyKey.length > 200) {
            throw new BadRequestException('A system refund idempotency key of at most 200 characters is required');
        }
        this.validateRefundReasons(dto.reasonKeys);
        this.validateNote(dto.requestNote);
        this.validateItemInput(dto.items);
        const request = await this.withPaymentLock(dto.paymentId, async (manager, payment) => {
            this.assertPaymentIsRefundable(payment);
            let request = await manager.findOne(RefundRequest, {
                where: { idempotencyKey: dto.idempotencyKey },
                relations: ['items'],
            });
            if (request) {
                const matches = request.paymentId === dto.paymentId &&
                    request.items.length === dto.items.length &&
                    request.items.every(item => dto.items.some(input =>
                        input.paymentItemId === item.paymentItemId && input.refundCount === item.refundCount));
                if (!matches) {
                    throw new BadRequestException('System refund idempotency key was already used for a different request');
                }
                if (request.status === 'APPROVED') {
                    return request;
                }
                this.assertPendingRefundRequest(request);
            } else {
                const reservations = await this.validateNewRefundRequest(manager, payment, dto);
                request = this.buildRefundRequestEntity('system', dto, payment, reservations);
                request.idempotencyKey = dto.idempotencyKey;
                request = await manager.save(RefundRequest, request);
            }
            return request;
        });
        if (request.status === 'APPROVED') {
            return this.mapToDTO(request);
        }
        return this.approveRequest(request, 'system', 'Automatically approved by the requesting application');
    }

    async createRefundRequest(
        user: UserAuthBackendDTO,
        dto: CreateRefundRequestDTO,
    ): Promise<RefundRequestDTO> {
        return this.withPaymentLock(dto.paymentId, async (manager, payment) => {
            const reservations = await this.validateNewRefundRequest(manager, payment, dto);
            const request = this.buildRefundRequestEntity(user.id, dto, payment, reservations);
            return this.mapToDTO(await manager.save(RefundRequest, request));
        });
    }

    async approveRefundRequest(
        user: UserAuthBackendDTO,
        requestId: string,
        dto: ResolveRefundRequestDTO = {},
    ): Promise<RefundRequestDTO> {
  
        this.validateNote(dto.resolutionNote);
        const request = await this.findRefundRequestWithItems(requestId);
        this.assertPendingRefundRequest(request);
        if (request.idempotencyKey) {
            throw new ForbiddenException('System refund requests must be resolved through the internal refund command');
        }
        if (!request.requestedToPaymentAccountId) {
            throw new BadRequestException('Refund request does not have a target payment account');
        }
        await this.authorizeRefundAction(user, request.requestedToPaymentAccountId, 'approve');
        return this.approveRequest(request, user.id, dto.resolutionNote);
    }

    async rejectRefundRequest(
        user: UserAuthBackendDTO,
        requestId: string,
        dto: ResolveRefundRequestDTO = {},
    ): Promise<RefundRequestDTO> {
        this.validateNote(dto.resolutionNote);
        const initial = await this.findRefundRequestWithItems(requestId);
        if (!initial.requestedToPaymentAccountId) {
            throw new BadRequestException('Refund request does not have a target payment account');
        }
        await this.authorizeRefundAction(user, initial.requestedToPaymentAccountId, 'reject');
        return this.withPaymentLock(initial.paymentId, async (manager, payment) => {
            this.assertNoApprovalInProgress(payment);
            const request = await manager.findOneOrFail(RefundRequest, {
                where: { id: requestId }, relations: ['items'],
            });
            this.assertPendingRefundRequest(request);
            if (request.idempotencyKey || await manager.exists(Payment, { where: { refundRequestId: request.id } })) {
                throw new BadRequestException('An initiated refund cannot be rejected; reconcile its payment channel operations first');
            }
            if (!request.requestedToPaymentAccountId) {
                throw new BadRequestException('Refund request does not have a target payment account');
            }
            return this.resolveRefundRequest(manager, request, user.id, 'REJECTED', dto.resolutionNote);
        });
    }

    private async withPaymentLock<T>(
        paymentId: string,
        action: (manager: EntityManager, payment: Payment) => Promise<T>,
    ): Promise<T> {
        if (typeof paymentId !== 'string' || !paymentId.trim()) {
            throw new BadRequestException('Payment ID is required');
        }
        return this.paymentRepo.manager.transaction(async manager => {
            const payment = await manager.findOne(Payment, {
                where: { id: paymentId },
                relations: ['items'],
                loadEagerRelations: false,
                lock: { mode: 'pessimistic_write' },
            });
            if (!payment) {
                throw new NotFoundException('Payment not found');
            }
            return action(manager, payment);
        });
    }

    private async validateNewRefundRequest(manager: EntityManager, payment: Payment, dto: CreateRefundRequestDTO): Promise<RefundRequest[]> {
        this.assertPaymentIsRefundable(payment);
        this.validateRefundItems(payment, dto.items);
        this.assertItemsBelongToSingleSeller(payment, dto.items);
        this.validateRefundReasons(dto.reasonKeys);
        this.validateNote(dto.requestNote);
        const reservations = await manager.find(RefundRequest, {
            where: { paymentId: payment.id, status: In(['PENDING', 'APPROVED']) },
            relations: ['items'],
        });
        const pending = reservations.filter(request => request.status === 'PENDING');
        for (const input of dto.items) {
            const item = this.getPaymentItemForRefundRequest(payment, input.paymentItemId);
            const reserved = pending.flatMap(request => request.items)
                .filter(candidate => candidate.paymentItemId === item.id)
                .reduce((total, candidate) => AmountCalculationUtil.addNumberValues(total, candidate.refundCount), 0);
            if (AmountCalculationUtil.addNumberValues(item.refundCount, reserved, input.refundCount) > item.quantity) {
                throw new BadRequestException(`Refund quantity is already reserved for item ${item.name}`);
            }
        }
        return reservations;
    }

    private async approveRequest(
        initial: RefundRequest,
        actorId: string,
        resolutionNote?: string,
    ): Promise<RefundRequestDTO> {
        this.validateNote(resolutionNote);
        const claim = await this.withPaymentLock(initial.paymentId, async (manager, payment) => {
            const request = await manager.findOneOrFail(RefundRequest, {
                where: { id: initial.id }, relations: ['items'],
            });
            if (request.status === 'APPROVED' && request.idempotencyKey) {
                return { request, token: undefined };
            }
            this.assertPendingRefundRequest(request);
            this.assertNoApprovalInProgress(payment);
            this.assertPaymentIsRefundable(payment);
            this.validateRefundItems(payment, request.items);
            this.assertItemsBelongToSingleSeller(payment, request.items);
            const token = randomUUID();
            await manager.update(Payment, payment.id, {
                refundApprovalToken: token,
                refundApprovalExpiresAt: new Date(Date.now() + 5 * 60_000),
            });
            return { request, token };
        });
        if (!claim.token) {
            return this.mapToDTO(claim.request);
        }
        try {
            await this.paymentService.createRefundPayment(claim.request);
            return await this.withPaymentLock(initial.paymentId, async (manager, payment) => {
                if (payment.refundApprovalToken !== claim.token) {
                    throw new ConflictException('Refund approval lease changed; retry the same request');
                }
                const request = await manager.findOneOrFail(RefundRequest, {
                    where: { id: initial.id }, relations: ['items'],
                });
                this.assertPendingRefundRequest(request);
                this.assertPaymentIsRefundable(payment);
                this.validateRefundItems(payment, request.items);
                await this.updateOriginalItemsRefundState(manager, payment, request.items);
                const result = await this.resolveRefundRequest(manager, request, actorId, 'APPROVED', resolutionNote);
                await manager.update(Payment, payment.id, { refundApprovalToken: null, refundApprovalExpiresAt: null });
                return result;
            });
        } finally {
            await this.paymentRepo.update(
                { id: initial.paymentId, refundApprovalToken: claim.token },
                { refundApprovalToken: null, refundApprovalExpiresAt: null },
            );
        }
    }

    private assertNoApprovalInProgress(payment: Payment): void {
        if (payment.refundApprovalToken && payment.refundApprovalExpiresAt &&
            payment.refundApprovalExpiresAt.getTime() > Date.now()) {
            throw new ConflictException('Another refund approval is in progress for this payment; retry later');
        }
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
        if (payment.externalPlatformId) {
            throw new BadRequestException('External platform refunds are not supported yet; process the refund on the external platform');
        }
        if (payment.type !== 'PURCHASE') {
            // Tekrar satın al o zaman :d
            throw new BadRequestException('Only PURCHASE payments can be refunded');
        }
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
        this.validateItemInput(items);
        for (const requestItem of items) {
            const paymentItem = this.getPaymentItemForRefundRequest(
                payment,
                requestItem.paymentItemId,
            );

            if (AmountCalculationUtil.addNumberValues(paymentItem.refundCount, requestItem.refundCount) > paymentItem.quantity) {
                throw new BadRequestException(
                    `Cannot refund more than purchased quantity for item ${paymentItem.name}`,
                );
            }
        }
    }

    private validateItemInput(items: CreateRefundRequestDTO['items']): void {
        if (!Array.isArray(items) || !items.length) {
            throw new BadRequestException('At least one refund item is required');
        }
        const ids = new Set<string>();
        for (const item of items) {
            if (!item || typeof item.paymentItemId !== 'string' || !item.paymentItemId.trim() ||
                typeof item.refundCount !== 'number' || !Number.isFinite(item.refundCount) || item.refundCount <= 0 ||
                Number(new Big(item.refundCount).round(4)) !== item.refundCount ||
                ids.has(item.paymentItemId)) {
                throw new BadRequestException('Refund items must have unique payment item IDs and positive finite quantities');
            }
            ids.add(item.paymentItemId);
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

    /**
     * Tek bir iade talebindeki tüm ürünlerin aynı satıcıya ait olduğunu doğrular. Eğer farklı satıcılara ait ürünler varsa, iade talebinin reddedilmesi için bir hata fırlatır.
     * @param payment Ödeme bilgisi
     * @param items İade talebindeki ürünler
     */
    private assertItemsBelongToSingleSeller(
        payment: Payment,
        items: { paymentItemId: string }[],
    ): void {
        const sellerAccountIds = new Set(
            items.map(
                (item) =>
                    this.getPaymentItemForRefundRequest(
                        payment,
                        item.paymentItemId,
                    ).sellerAccountId,
            ),
        );

        if (sellerAccountIds.size !== 1 || sellerAccountIds.has(undefined) || sellerAccountIds.has('')) {
            throw new BadRequestException(
                'Refund items must belong to the same seller account. Create separate refund requests for each seller.',
            );
        }
    }

    private buildRefundRequestEntity(
        actorId: string,
        dto: CreateRefundRequestDTO,
        payment: Payment,
        reservations: RefundRequest[],
    ): RefundRequest {
        const request = new RefundRequest();
        request.paymentId = dto.paymentId;
        request.requestedByAccountId = actorId;
        const firstItem = this.getPaymentItemForRefundRequest(payment, dto.items[0].paymentItemId);
        request.requestedByPaymentAccountId = payment.customerAccountId;
        request.requestedToPaymentAccountId = firstItem.sellerAccountId;
        request.status = 'PENDING';
        request.currency = payment.currency;
        request.reasonKeys = dto.reasonKeys;
        request.requestNote = dto.requestNote;
        request.items = this.buildRefundRequestItems(payment, dto.items, reservations);
        return request;
    }

    private validateRefundReasons(reasonKeys: CreateRefundRequestDTO['reasonKeys']): void {
        if (!Array.isArray(reasonKeys) || !reasonKeys.length || reasonKeys.some((key) => !REFUND_REASON_KEYS.includes(key))) {
            throw new BadRequestException('At least one valid refund reason is required');
        }
    }

    private validateNote(note?: string): void {
        if (note != null && (typeof note !== 'string' || note.length > 10000)) {
            throw new BadRequestException('Refund notes cannot exceed 10000 characters');
        }
    }

    private buildRefundRequestItems(
        payment: Payment,
        items: CreateRefundRequestDTO['items'],
        reservations: RefundRequest[],
    ): RefundRequestItem[] {
        return items.map((requestItem) => {
            const originalItem = this.getPaymentItemForRefundRequest(
                payment,
                requestItem.paymentItemId,
            );
            const refundItem = new RefundRequestItem();
            const reservedItems = reservations.flatMap(request => request.items)
                .filter(item => item.paymentItemId === originalItem.id);
            const reservedCount = AmountCalculationUtil.addNumberValues(
                ...reservedItems.map(item => item.refundCount));
            const isFinalQuantity = AmountCalculationUtil.addNumberValues(reservedCount, requestItem.refundCount) === originalItem.quantity;
            const allocateAmount = (total: number, reservedAmounts: number[]): number => isFinalQuantity
                ? AmountCalculationUtil.minusNumberValues(total, ...reservedAmounts)
                : Number(new Big(total).times(requestItem.refundCount).div(originalItem.quantity).round(4));
            const unitAmountWithoutTax =
                originalItem.quantity > 0
                    ? originalItem.unTaxAmount / originalItem.quantity
                    : 0;

            refundItem.itemClass = originalItem.itemClass;
            refundItem.appComissionAmount = allocateAmount(
                originalItem.appComissionAmount, reservedItems.map(item => item.appComissionAmount));
            refundItem.appComissionPercent = originalItem.appComissionPercent;
            refundItem.variation = originalItem.variation;
            refundItem.paymentItemId = requestItem.paymentItemId;
            refundItem.realItemId = originalItem.itemId;
            refundItem.refundCount = requestItem.refundCount;
            refundItem.itemName = originalItem.name;
            refundItem.unitAmount = originalItem.unitAmount;
            refundItem.unitAmountWithoutTax = unitAmountWithoutTax;
            refundItem.refundAmount = allocateAmount(originalItem.totalAmount, reservedItems.map(item => item.refundAmount));
            refundItem.refundAmountWithoutTax = allocateAmount(
                originalItem.unTaxAmount, reservedItems.map(item => item.refundAmountWithoutTax));
            refundItem.refundTaxAmount = AmountCalculationUtil.minusNumberValues(
                refundItem.refundAmount, refundItem.refundAmountWithoutTax);

            return refundItem;
        });
    }

    private async authorizeRefundAction(
        user: UserAuthBackendDTO,
        targetPaymentAccountId: string,
        action: 'approve' | 'reject',
    ): Promise<void> {
        const ownedSellerIds = await this.authUtilService.searchOwnedIds(
            PostralConstants.ENTITY_NAME_ACCOUNT,
            [[Capability.OWNER], [Capability.EDIT]],
            { userId: user.id },
        );

        if (!ownedSellerIds) {
            throw new ForbiddenException(
                `User is not authorized to ${action} this refund`,
            );
        }
        // exec(`kdialog --msgbox "ownedSellerIds: ${JSON.stringify(ownedSellerIds)}, targetPaymentAccountId: ${targetPaymentAccountId}"`);
        if (!ownedSellerIds.includes(targetPaymentAccountId)) {
            throw new ForbiddenException(
                'User does not have EDITOR or OWNER rights for the relevant seller accounts',
            );
        }
    }


    private async updateOriginalItemsRefundState(
        manager: EntityManager,
        payment: Payment,
        requestItems: RefundRequestItem[],
    ): Promise<void> {
        await Promise.all(
            requestItems.map((requestItem) => {
                const originalItem = this.getPaymentItemForRefundRequest(
                    payment,
                    requestItem.paymentItemId,
                );

                originalItem.refundCount = AmountCalculationUtil.addNumberValues(originalItem.refundCount, requestItem.refundCount);
                if (originalItem.refundCount >= originalItem.quantity) {
                    originalItem.refunded = true;
                }

                return manager.save(PostralPaymentItem, originalItem);
            }),
        );
    }

    private async resolveRefundRequest(
        manager: EntityManager,
        request: RefundRequest,
        actorId: string,
        status: RefundRequestStatus,
        resolutionNote?: string,
    ): Promise<RefundRequestDTO> {
        this.validateNote(resolutionNote);
        request.status = status;
        request.resolvedByAccountId = actorId;
        request.resolutionNote = resolutionNote;

        const savedRequest = await manager.save(RefundRequest, request);
        return this.mapToDTO(savedRequest);
    }

    private mapToDTO(entity: RefundRequest): RefundRequestDTO {
        return {
            id: entity.id,
            idempotencyKey: entity.idempotencyKey,
            paymentId: entity.paymentId,
            status: entity.status,
            requestedByAccountId: entity.requestedByAccountId,
            resolvedByAccountId: entity.resolvedByAccountId,
            requestedByPaymentAccountId: entity.requestedByPaymentAccountId,
            requestedToPaymentAccountId: entity.requestedToPaymentAccountId,
            createdAt: entity.createdAt,
            updatedAt: entity.updatedAt,
            currency: entity.currency,
            reasonKeys: entity.reasonKeys || [],
            requestNote: entity.requestNote,
            resolutionNote: entity.resolutionNote,
            items:
                entity.items?.map((i) => ({
                    id: i.id,
                    paymentItemId: i.paymentItemId,
                    realItemId: i.realItemId,
                    refundCount: i.refundCount,
                    itemName: i.itemName,
                    unitAmount: i.unitAmount,
                    unitAmountWithoutTax: i.unitAmountWithoutTax,
                    refundAmount: i.refundAmount,
                    refundAmountWithoutTax: i.refundAmountWithoutTax,
                    refundTaxAmount: i.refundTaxAmount,
                    variation: i.variation,
                    itemClass: i.itemClass,
                    appComissionAmount: i.appComissionAmount,
                    appComissionPercent: i.appComissionPercent,
                })) || [],
        };
    }

    async searchRefundRequests(
        user: UserAuthBackendDTO,
        searchParams: RefundRequestSearchDTO,
    ): Promise<RawSearchResult<RefundRequestDTO>> {
        const query = {};
        const orClauses: any[] = [];
        // todo: Admin modu kontrolü eklenmeli. Admin modunda accountId'ye göre filtreleme yapmayacak. Aksi halde yapacak. Entity Ownership'ten account idler çekilecek
        if (searchParams.mode != 'ADMIN') {
            const ids = await this.authUtilService.fetchUserAccountIds(
                user.id,
                [[Capability.OWNER], [Capability.EDIT], [Capability.VIEW]],
            )
            orClauses.push({ requestedByPaymentAccountId: In(ids) });
            orClauses.push({ requestedToPaymentAccountId: In(ids) });
        } else {
            orClauses.push({})
        }
        // TODO: Diğer filtreleme kriterleri eklenecek (status, date range vb.)
        if (searchParams.status) {
            query['status'] = searchParams.status;
        }
        return TypeormSearchUtil.modelSearch<RefundRequestDTO>(
            this.refundRequestRepo,
            searchParams.size,
            searchParams.page,
            {},
            ['items'],
            orClauses.map((clause) => ({ ...clause, ...query })),
        );
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
