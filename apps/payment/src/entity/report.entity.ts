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

/**
 * One Report row = one aggregated period bucket for a ReportQuery.
 * Unique on (queryId, periodLabel, currency) so we never double-create.
 */
@Entity()
@Unique(['queryId', 'periodLabel', 'currency'])
export class Report {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @Column()
    queryId: string;

    @ManyToOne(() => ReportQuery, (q) => q.reports, { onDelete: 'CASCADE' })
    @JoinColumn({ name: 'queryId' })
    query: ReportQuery;

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
    createdAt: Date;

    // --- Asıl hesap kısımları ---
    @Column({ type: 'int', default: 0 })
    paymentCount: number;

    // Toplam satın alma
    @Column({ type: 'decimal', precision: 15, scale: 2, default: 0 })
    totalSaleAmount: number;

    // Toplam iade
    @Column({ type: 'decimal', precision: 15, scale: 2, default: 0 })
    totalRefundAmount: number;

    // Toplam satın alma vergisi
    @Column({ type: 'decimal', precision: 15, scale: 2, default: 0 })
    totalSaleTaxAmount: number;

    // Toplam iade vergisi
    @Column({ type: 'decimal', precision: 15, scale: 2, default: 0 })
    totalRefundTaxAmount: number;

    // Net vergi (satın alma vergisi - iade vergisi)
    @Column({ type: 'decimal', precision: 15, scale: 2, default: 0 })
    netTaxAmount: number;


    // Net satın alma (satın alma - iade)
    @Column({ type: 'decimal', precision: 15, scale: 2, default: 0 })
    netSaleAmount: number;

    // Net gelir (net satın alma - net vergi)
    @Column({ type: 'decimal', precision: 15, scale: 2, default: 0 })
    netRevenue: number;
}
