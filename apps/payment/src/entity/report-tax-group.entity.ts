import { Column, Entity, JoinColumn, ManyToOne, PrimaryGeneratedColumn, Unique } from "typeorm";
import { ReportCalculationValueHolder } from "./base/report-calculation-value-holder";

/**
 * Vergi oranlarına göre gruplanmış rapor verisi. Bir Report'un birden fazla ReportTaxGroup'u olabilir.
 * Örneğin, bir Report'un içinde "Standard Rate", "Reduced Rate" gibi farklı taxGroupName'lere sahip ReportTaxGroup'lar olabilir.
 * Unique on (reportId, taxGroupName, currency) ile aynı rapor için aynı vergi grubunun ve para biriminin birden fazla kez eklenmesini engelliyoruz.
 * Rapor oluşturulurken bu tabloya da ilgili taxGroupName'lerle birlikte toplamRevenue, totalExpense, netIncome, totalTaxAmount ve paymentCount değerleri eklenir.
 * Raporun digestion işlemi sırasında bu değerler güncellenir.
 */
@Entity()
@Unique(['reportId', 'taxPercent', 'currency'])
export class ReportTaxGroup implements ReportCalculationValueHolder {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @Column()
    reportId: string;

    @Column({ length: 50 })
    taxGroupName: string;

    @Column({ length: 50 })
    taxPercent: string;

    @Column({ length: 10 })
    currency: string;

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