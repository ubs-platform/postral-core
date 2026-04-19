import { Column, Entity, PrimaryGeneratedColumn, Unique } from "typeorm";
import { MoneyDbField } from "./base";

@Entity("report_expense")
@Unique(["reportId", "accountId","expenseKey"])
export class ReportExpense {
    @PrimaryGeneratedColumn('uuid')
    id!: string;

    @Column()
    reportId!: string;

    @Column()
    accountId!: string;

    /**
     * Bu alan Masrafların tipini belirtmek için kullanılır. Örneğin:
     * - Rapor toplamı için "REPORT_TOTAL"
     * - Platform Komisyon (Toplam) için "PLATFORM_COMISSION_TOTAL"
     * - Bir item class'ına ait masraf için "ITEM_CLASS_COMISSION_{itemClassName}" gibi bir format kullanılabilir. Örneğin, elektronik ürünler için "ITEM_CLASS_COMISSION_ELECTRONICS".
     * - Ödeme hizmetlerine ait masraflar için "PAYMENT_SERVICE_FEE" gibi bir format kullanılabilir.
     * Bu şekilde, raporlama sırasında masrafları tiplerine göre ayırabilir ve analiz edebiliriz. 
     * Ayrıca, yeni masraf tipleri eklemek istediğimizde de esneklik sağlamış oluruz.
     */
    @Column({ type: "varchar", length: 600, nullable: true })
    expenseKey!: string;

    @Column(MoneyDbField)
    expenseAmount: number = 0;

    @Column({ type: "varchar", nullable: true })
    itemClass?: string;

    @Column({ type: "boolean", default: true })
    totalExpense: boolean = true;

    /**
     * Sıralama ağırlığı. 1 = toplam masraf (REPORT_TOTAL), 2 = komisyon/ödeme hizmeti
     * (PLATFORM_COMISSION_TOTAL, PAYMENT_SERVICE_FEE), 3 = ürün grubu komisyonları (ITEM_CLASS_COMISSION_*).
     * Frontend bu sıraya göre gösterir.
     */
    @Column({ type: 'int', default: 2 })
    displayWeight: number = 2;

    // Zaten reportId'de var eğer çok lazım olursa ekleyebiliriz
    // @Column({ type: "varchar", nullable: true })
    // currency?: string;


    @Column({ type: 'datetime', default: () => 'CURRENT_TIMESTAMP', onUpdate: 'CURRENT_TIMESTAMP' })
    updatedAt!: Date;

    @Column({ type: 'datetime', default: () => 'CURRENT_TIMESTAMP' })
    createdAt!: Date;
}