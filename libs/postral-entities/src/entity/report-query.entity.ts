import { Column, Entity, OneToMany, PrimaryGeneratedColumn } from 'typeorm';
import { Report } from './report.entity';
import { ReportDateGrouping, ReportQueryType, ReportType } from '@tk-postral/payment-common';

@Entity()
export class ReportQuery {
    @PrimaryGeneratedColumn('uuid')
    id!: string;

    @Column({ length: 200 })
    name!: string;

    @Column({ type: 'mediumtext', nullable: true, default: '' })
    description!: string;

    // Query tipini filtrelemeye gerek yok tüm gelir değerleri (ciro, net, gider) tek bir query'de toplanacak. 

    /**
     * If set, only payments involving this account (as customer OR seller) are included.
     */
    @Column({ nullable: true })
    ownerAccountId?: string;

    /**
     * If set, only payments with this currency are included.
     */
    @Column({ nullable: true })
    currency?: string;

    /**
     * How to bucket reports inside this query.
     * ALL → single report for all time
     */
    @Column({ type: 'varchar', length: 10, default: 'MONTHLY' })
    dateGrouping!: ReportDateGrouping;

    @Column({ type: 'datetime', default: () => 'CURRENT_TIMESTAMP' })
    createdAt!: Date;

    @Column({
        type: 'datetime',
        default: () => 'CURRENT_TIMESTAMP',
        onUpdate: 'CURRENT_TIMESTAMP',
    })
    updatedAt!: Date;

    @OneToMany(() => Report, (r) => r.query, { cascade: true })
    reports!: Report[];

    /**
     * SELLER → raporlar sadece satıcı bazında oluşturulur, sadece seller raporlarında digestion işlemi yapılır.
     * PLATFORM_FLOW → Tüm para akışları raporlanır, digestion işlemi yapılır.
     * PLATFORM -> Satışlardan platformun komisyonlardan geliri, vergisi ve giderleri raporlanır, digestion işlemi yapılır.
     * 
     * TODO: PlatformFlow ve Platform setlenmesi sadece admin izin verilir.
     * Platformun komisyonu faturalandırabilmesi için Günlük Platform olarak ayarlanması gerekir
     */
    @Column({ type: 'varchar', length: 20, default: 'SELLER' })
    reportType: ReportType = 'SELLER';
}
