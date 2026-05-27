import {
    Column,
    Entity,
    Index,
    JoinColumn,
    ManyToOne,
    OneToMany,
    PrimaryGeneratedColumn,
    Unique,
} from 'typeorm';
import { ReportQuery } from './report-query.entity';
import { BaseReport, ReportType } from '@tk-postral/payment-common';
import { MoneyDbField } from './base';
import { Account } from './account.entity';
import Big = require('big.js');

/**
 * One Report row = one aggregated period bucket for a ReportQuery.
 * Unique on (queryId, reportType, periodLabel, currency) so we never double-create.
 */
@Entity()
@Unique(['queryId', "reportType", 'periodLabel', 'currency'])
export class Report implements BaseReport {
    @PrimaryGeneratedColumn('uuid')
    id!: string;

    @Column({ type: "varchar", length: 20, default: "SELLER" })
    reportType: ReportType = "SELLER";

    @Column()
    queryId!: string;

    @ManyToOne(() => ReportQuery, (q) => q.reports, { onDelete: 'CASCADE', eager: true })
    @JoinColumn({ name: 'queryId' })
    query!: ReportQuery;


    @Column(MoneyDbField)
    totalSaleAmountWithoutExpense: number | Big = 0;

    @Column(MoneyDbField)
    totalExpenseAmount: number | Big = 0;


    /**
     * Bucket label depending on ReportQuery.dateGrouping:
     *  DAILY   → "2026-03-24"
     *  WEEKLY  → "2026-W12"
     *  MONTHLY → "2026-03"
     *  YEARLY  → "2026"
     *  ALL     → "ALL"
     */
    @Column({ length: 60 })
    periodLabel: string = "";

    @Column({ length: 10 })
    currency: string = "TRY";

    @Column({ type: 'datetime', nullable: true })
    lastDigestedAt?: Date;

    @Column({ type: 'datetime', default: () => 'CURRENT_TIMESTAMP' })
    createdAt = new Date();

    // --- Asıl hesap kısımları ---
    @Column({ type: 'int', default: 0 })
    paymentCount = 0;

    // Toplam satın alma
    @Column(MoneyDbField)
    totalSaleAmount: number | Big = 0;

    // Toplam iade
    @Column(MoneyDbField)
    totalRefundAmount: number | Big = 0;

    // Toplam satın alma vergisi
    @Column(MoneyDbField)
    totalSaleTaxAmount: number | Big = 0;

    // Toplam iade vergisi
    @Column(MoneyDbField)
    totalRefundTaxAmount: number | Big = 0;

    // Net vergi (satın alma vergisi - iade vergisi)
    @Column(MoneyDbField)
    netTaxAmount: number | Big = 0;


    // Net satın alma (satın alma - iade)
    @Column(MoneyDbField)
    netSaleAmount: number | Big = 0;

    // Net gelir (net satın alma - net vergi)
    @Column(MoneyDbField)
    netRevenue: number | Big = 0;

    @Column({ length: 255, nullable: true })
    lastDigestedPaymentId?: string;

    @Column({ type: 'boolean', default: false })
    archived: boolean = false;

    // Fatura kesildiğinde set edilir. NULL ise henüz faturalanmamış demektir.
    @Column({ type: 'datetime', nullable: true })
    billedAt?: Date;

    @Column(MoneyDbField)
    totalExpense: number | Big = 0;

    // Vergisiz net hakediş: netRevenue - masraflar
    @Column(MoneyDbField)
    netRevenueWithoutExpense: number | Big = 0;

    // Vergili net hakediş: netSaleAmount - masraflar.
    // Satıcıya hakediş ödemesinde bu değer kullanılır çünkü vergisini satıcı öder.
    @Column(MoneyDbField)
    netRevenueWithoutExpenseTaxed: number | Big = 0;
}
