import { Test } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Report, ReportExpense, ReportItem, ReportPaymentRelation, ReportPlatform, ReportTaxGroup } from '@tk-postral/postral-entities';
import { POSTRAL_INSTANCE } from '@tk-postral/payment-common';
import { ReportMapper } from './report-mapper';
import { ReportService } from '../service/report.service';
import { PaymentCommonService } from '../service/payment-common.service';
import { AuthUtilService } from '../service/auth-util.service';
import { ReportDigestionService } from '../service/report-digestion.service';

describe('Report platform detail contract', () => {
    it('loads the platform breakdown through report detail and maps all counters and amounts', async () => {
        const report = Object.assign(new Report(), { id: 'report' });
        const platform = Object.assign(new ReportPlatform(), {
            id: 'platform-row', reportId: report.id, accountId: 'seller',
            platformKey: POSTRAL_INSTANCE, platformName: 'Postral',
            purchaseCount: 3, refundCount: 1, soldQuantity: 4.5, refundedQuantity: 1,
            totalSaleAmount: 540, totalRefundAmount: 120, totalSaleTaxAmount: 90, totalRefundTaxAmount: 20,
            netSaleAmount: 420, netRevenue: 350,
        });
        const item = ReportItem.create('report', '', 'Product', '', 120, 20, 0, 10);
        const platformRepo = { find: jest.fn().mockResolvedValue([platform]) };
        const module = await Test.createTestingModule({
            providers: [
                ReportService, ReportMapper,
                { provide: getRepositoryToken(Report), useValue: { findOne: async () => report } },
                { provide: getRepositoryToken(ReportTaxGroup), useValue: { find: async () => [] } },
                { provide: getRepositoryToken(ReportExpense), useValue: { find: async () => [] } },
                { provide: getRepositoryToken(ReportPaymentRelation), useValue: {} },
                { provide: getRepositoryToken(ReportItem), useValue: { find: async () => [item] } },
                { provide: getRepositoryToken(ReportPlatform), useValue: platformRepo },
                { provide: PaymentCommonService, useValue: {} },
                { provide: AuthUtilService, useValue: {} },
                { provide: ReportDigestionService, useValue: {} },
            ],
        }).compile();
        const dto = await module.get(ReportService).fetchReportFull('report');
        expect(platformRepo.find).toHaveBeenCalledWith({ where: { reportId: 'report' }, order: { platformKey: 'ASC' } });
        expect(dto.platforms).toEqual([platform]);
        expect(dto.items[0]).toMatchObject({ identifiedByName: true, itemName: 'Product', itemId: '' });
    });

    it('returns empty platform arrays for historical reports and identifies legacy ID-less rows', () => {
        const item = Object.assign(new ReportItem(), { itemId: '', identifiedByName: false });
        const dto = new ReportMapper().toFullDto(new Report(), [], [], [item], []);
        expect(dto.platforms).toEqual([]);
        expect(dto.items[0].identifiedByName).toBe(true);
    });
});
