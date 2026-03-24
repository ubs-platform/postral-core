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

    /** Toplam satış (ciro) – PURCHASE payments */
    @Column({ type: 'double', default: 0 })
    totalRevenue: number;

    /** Toplam iade (gider) – REFUND payments */
    @Column({ type: 'double', default: 0 })
    totalExpense: number;

    /** Net gelir = totalRevenue - totalExpense */
    @Column({ type: 'double', default: 0 })
    netIncome: number;

    @Column({ type: 'double', default: 0 })
    totalTaxAmount: number;

    @Column({ type: 'int', default: 0 })
    paymentCount: number;

    @Column({ type: 'datetime', nullable: true })
    lastDigestedAt: Date;

    @Column({ type: 'datetime', default: () => 'CURRENT_TIMESTAMP' })
    createdAt: Date;
}
