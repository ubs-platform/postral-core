import { Test } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import {
    Report, ReportQuery, ReportTaxGroup, ReportPaymentRelation, ReportExpense, PaymentChannelOperation,
} from '@tk-postral/postral-entities';
import { ReportItem } from '@tk-postral/postral-entities/entity/report-item.entity';
import { PaymentFullDTO } from '@tk-postral/payment-common';
import { ReportDigestionService } from './report-digestion.service';
import { SellerReportSetupService } from './seller-report-setup.service';
import { PaymentCommonService } from './payment-common.service';
import { AppComissionService } from './app-commission.service';
import { SellerPaymentOrderSearchService } from './transaction-search.service';
import { AdminSettingsService } from './admin-settings.service';
import { EventSenderService } from './event-management.service';

describe('Report digestion setup integration', () => {
    let service: ReportDigestionService;
    const queries = { find: jest.fn() };
    const setup = { ensureDailyQueries: jest.fn() };

    beforeEach(async () => {
        jest.resetAllMocks();
        const module = await Test.createTestingModule({
            providers: [
                ReportDigestionService,
                { provide: getRepositoryToken(ReportQuery), useValue: queries },
                ...[Report, ReportTaxGroup, ReportPaymentRelation, ReportExpense, PaymentChannelOperation, ReportItem]
                    .map(entity => ({ provide: getRepositoryToken(entity), useValue: {} })),
                ...[PaymentCommonService, AppComissionService, SellerPaymentOrderSearchService, AdminSettingsService, EventSenderService]
                    .map(provide => ({ provide, useValue: {} })),
                { provide: SellerReportSetupService, useValue: setup },
            ],
        }).compile();
        service = module.get(ReportDigestionService);
    });

    it('keeps platform sources and uses shared setup once per seller, including configured monthly sources', async () => {
        const platform = Object.assign(new ReportQuery(), { id: 'platform', reportType: 'PLATFORM' });
        const monthly = Object.assign(new ReportQuery(), { id: 'monthly', dateGrouping: 'MONTHLY' });
        queries.find.mockResolvedValue([platform]);
        setup.ensureDailyQueries.mockResolvedValue([monthly]);
        const payment = Object.assign(new PaymentFullDTO(), {
            currency: 'TRY', items: [{ sellerAccountId: 'b' }, { sellerAccountId: 'a' }, { sellerAccountId: 'b' }],
        });
        const result = await service['findMatchingQueries'](payment);
        expect(setup.ensureDailyQueries.mock.calls).toEqual([['a', 'TRY'], ['b', 'TRY']]);
        expect(result).toEqual([platform, monthly, monthly]);
        expect(queries.find).toHaveBeenCalledWith(expect.objectContaining({
            where: expect.objectContaining({ currency: 'TRY' }),
        }));
    });

    it('surfaces setup failures rather than silently omitting seller reports', async () => {
        queries.find.mockResolvedValue([]);
        setup.ensureDailyQueries.mockRejectedValue(new Error('lock failed'));
        const payment = Object.assign(new PaymentFullDTO(), { currency: 'TRY', items: [{ sellerAccountId: 'seller' }] });
        await expect(service['findMatchingQueries'](payment)).rejects.toThrow('lock failed');
    });
});
