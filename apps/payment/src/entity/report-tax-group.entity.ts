import { BaseReport } from "@tk-postral/payment-common";
import { Column, Entity, JoinColumn, ManyToOne, PrimaryGeneratedColumn, Unique } from "typeorm";

/**
 * Vergi oranlarına göre gruplanmış rapor verisi. Bir Report'un birden fazla ReportTaxGroup'u olabilir.
 * Örneğin, bir Report'un içinde "Standard Rate", "Reduced Rate" gibi farklı taxGroupName'lere sahip ReportTaxGroup'lar olabilir.
 * Unique on (reportId, taxGroupName, currency) ile aynı rapor için aynı vergi grubunun ve para biriminin birden fazla kez eklenmesini engelliyoruz.
 * Rapor oluşturulurken bu tabloya da ilgili taxGroupName'lerle birlikte toplamRevenue, totalExpense, netIncome, totalTaxAmount ve paymentCount değerleri eklenir.
 * Raporun digestion işlemi sırasında bu değerler güncellenir.
 */
@Entity()
@Unique(['reportId', 'taxPercent', 'currency'])
export class ReportTaxGroup implements BaseReport {
    @PrimaryGeneratedColumn('uuid')
    id!: string;

    @Column()
    reportId!: string;

    @Column({ length: 50 })
    taxGroupName: string = "";

    @Column({ length: 50 })
    taxPercent: string = "";

    @Column({ length: 10 })
    currency: string = "TRY";

    // --- Asıl hesap kısımları ---
    @Column({ type: 'int', default: 0 })
    paymentCount: number = 0;


    @Column({ type: 'decimal', precision: 15, scale: 2, default: 0, transformer: { from: (v) => Number(v), to: (v) => v } })
    totalSaleAmountWithoutExpense: number = 0;

    @Column({type: "decimal", precision: 15, scale: 2, default: 0, transformer: { from: (v) => Number(v), to: (v) => v } })
    totalExpenseAmount: number = 0;

    // Toplam satın alma
    @Column({ type: 'decimal', precision: 15, scale: 2, default: 0 })
    totalSaleAmount: number = 0;

    // Toplam iade
    @Column({ type: 'decimal', precision: 15, scale: 2, default: 0 })
    totalRefundAmount: number = 0;

    // Toplam satın alma vergisi
    @Column({ type: 'decimal', precision: 15, scale: 2, default: 0 })
    totalSaleTaxAmount: number = 0;

    // Toplam iade vergisi
    @Column({ type: 'decimal', precision: 15, scale: 2, default: 0 })
    totalRefundTaxAmount: number = 0;

    // Net vergi (satın alma vergisi - iade vergisi)
    @Column({ type: 'decimal', precision: 15, scale: 2, default: 0 })
    netTaxAmount: number = 0;


    // Net satın alma (satın alma - iade)
    @Column({ type: 'decimal', precision: 15, scale: 2, default: 0 })
    netSaleAmount: number = 0;

    // Net gelir (net satın alma - net vergi)
    @Column({ type: 'decimal', precision: 15, scale: 2, default: 0 })
    netRevenue: number = 0;
}