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
export class ReportTaxGroup {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @Column()
    reportId: string;

    @Column({ length: 50 })
    taxGroupName: string;

    @Column({ length: 50 })
    taxPercent: string;

    /** Toplam satış (ciro) – PURCHASE payments */
    @Column({ type: 'double', default: 0 })
    totalRevenue: number;

    /** Toplam iade (gider) – REFUND payments */
    @Column({ type: 'double', default: 0 })
    totalExpense: number;

    /** Net gelir = totalRevenue - totalExpense */
    @Column({ type: 'double', default: 0 })
    netIncome: number;

    @Column({ type: 'int', default: 0 })
    paymentCount: number;

    /** Toplam vergi miktarı */
    @Column({ type: 'double', default: 0 })
    totalTaxAmount: number;

    @Column({ length: 10 })
    currency: string;
}