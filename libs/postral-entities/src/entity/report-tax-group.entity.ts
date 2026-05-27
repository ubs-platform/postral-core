import { BaseReport } from "@tk-postral/payment-common";
import { Column, Entity, JoinColumn, ManyToOne, PrimaryGeneratedColumn, Unique } from "typeorm";
import { BigintDbField, MoneyDbField } from "./base";
import Big = require('big.js');

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
    @Column(BigintDbField)
    paymentCount: number = 0;


    @Column(MoneyDbField)
    totalSaleAmountWithoutExpense: number | Big = 0;

    @Column(MoneyDbField)
    totalExpenseAmount: number | Big = 0;

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
}