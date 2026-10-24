import { Column, Entity, PrimaryGeneratedColumn, Unique } from 'typeorm';
import { BigintDbField, MoneyDbField } from './base';

@Entity('report_platform')
@Unique(['reportId', 'accountId', 'platformKey'])
export class ReportPlatform {
    @PrimaryGeneratedColumn('uuid')
    id!: string;

    @Column({ length: 36 })
    reportId!: string;

    @Column({ length: 36 })
    accountId!: string;

    @Column()
    platformKey!: string;

    @Column({ nullable: true, length: 36 })
    externalPlatformId?: string;

    @Column()
    platformName!: string;

    @Column(BigintDbField)
    purchaseCount: number = 0;

    @Column(BigintDbField)
    refundCount: number = 0;

    @Column(MoneyDbField)
    soldQuantity: number = 0;

    @Column(MoneyDbField)
    refundedQuantity: number = 0;

    @Column(MoneyDbField)
    totalSaleAmount: number = 0;

    @Column(MoneyDbField)
    totalRefundAmount: number = 0;

    @Column(MoneyDbField)
    totalSaleTaxAmount: number = 0;

    @Column(MoneyDbField)
    totalRefundTaxAmount: number = 0;

    @Column(MoneyDbField)
    netSaleAmount: number = 0;

    @Column(MoneyDbField)
    netRevenue: number = 0;
}
