import {
    Column,
    Entity,
    Index,
    JoinColumn,
    ManyToOne,
    PrimaryGeneratedColumn,
    Unique,
} from 'typeorm';
import { ReportQuery } from './report-query.entity';
import { ReportCalculationValueHolder } from './base/report-calculation-value-holder';

/**
 * One Report row = one aggregated period bucket for a ReportQuery.
 * Unique on (queryId, periodLabel, currency) so we never double-create.
 */
@Entity()
@Unique(['queryId', 'periodLabel', 'currency'])
export class Report implements ReportCalculationValueHolder{
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @Column()
    queryId: string;

    @ManyToOne(() => ReportQuery, (q) => q.reports, { onDelete: 'CASCADE' })
    @JoinColumn({ name: 'queryId' })
    query: ReportQuery;

    @Column({ nullable: true })
    accountId: string;

    /**
     * Bucket label depending on ReportQuery.dateGrouping:
     *  DAILY   → "2026-03-24"
     *  WEEKLY  → "2026-W12"
     *  MONTHLY → "2026-03"
     *  YEARLY  → "2026"
     *  ALL     → "ALL"
     */
    @Column({ length: 20 })
    periodLabel: string;

    @Column({ length: 10 })
    currency: string;

    @Column({ type: 'datetime', nullable: true })
    lastDigestedAt: Date;

    @Column({ type: 'datetime', default: () => 'CURRENT_TIMESTAMP' })
    createdAt = new Date();

    // --- Asıl hesap kısımları ---
    @Column({ type: 'int', default: 0 })
    paymentCount = 0;

    // Toplam satın alma
    @Column({ type: 'decimal', precision: 15, scale: 2, default: 0 })
    totalSaleAmount = 0;

    // Toplam iade
    @Column({ type: 'decimal', precision: 15, scale: 2, default: 0 })
    totalRefundAmount = 0;

    // Toplam satın alma vergisi
    @Column({ type: 'decimal', precision: 15, scale: 2, default: 0 })
    totalSaleTaxAmount = 0;

    // Toplam iade vergisi
    @Column({ type: 'decimal', precision: 15, scale: 2, default: 0 })
    totalRefundTaxAmount = 0;

    // Net vergi (satın alma vergisi - iade vergisi)
    @Column({ type: 'decimal', precision: 15, scale: 2, default: 0 })
    netTaxAmount = 0;


    // Net satın alma (satın alma - iade)
    @Column({ type: 'decimal', precision: 15, scale: 2, default: 0 })
    netSaleAmount = 0;

    // Net gelir (net satın alma - net vergi)
    @Column({ type: 'decimal', precision: 15, scale: 2, default: 0 })
    netRevenue = 0;
}
