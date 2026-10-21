import { Test } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Report, ReportQuery } from '@tk-postral/postral-entities';
import { AdminSettingsDto } from '@tk-postral/payment-common';
import { BillingService } from './billing.service';
import { AdminSettingsService } from './admin-settings.service';
import { PaymentService } from './payment.service';

describe('Platform billing account', () => {
    it('does not bill the platform account to itself but still handles a separate platform seller', async () => {
        const builder = {
            select: jest.fn().mockReturnThis(), where: jest.fn().mockReturnThis(), andWhere: jest.fn().mockReturnThis(),
            getRawMany: jest.fn().mockResolvedValue([{ ownerAccountId: 'platform' }, { ownerAccountId: 'own-seller' }]),
        };
        const reports = {
            select: jest.fn().mockReturnThis(), innerJoin: jest.fn().mockReturnThis(),
            where: jest.fn().mockReturnThis(), andWhere: jest.fn().mockReturnThis(),
            getRawMany: jest.fn().mockResolvedValue([]),
        };
        const module = await Test.createTestingModule({ providers: [
            BillingService,
            { provide: getRepositoryToken(Report), useValue: { createQueryBuilder: () => reports } },
            { provide: getRepositoryToken(ReportQuery), useValue: { createQueryBuilder: () => builder } },
            { provide: AdminSettingsService, useValue: {} },
            { provide: PaymentService, useValue: {} },
        ] }).compile();
        const service = module.get(BillingService);
        await service.runBilling(Object.assign(new AdminSettingsDto(), { billingAccountId: 'platform' }));
        expect(reports.where).toHaveBeenCalledTimes(1);
        expect(reports.where).toHaveBeenCalledWith('rq.ownerAccountId = :ownerAccountId', { ownerAccountId: 'own-seller' });
    });
});
