import { Column, Entity, PrimaryGeneratedColumn, Unique } from "typeorm";
import { BigintDbField, MoneyDbField } from "./base";

@Entity("report_item")
@Unique(["reportId", "accountId", "itemId", "itemVariation"])
export class ReportItem {
    @PrimaryGeneratedColumn('uuid')
    id!: string;

    @Column()
    reportId!: string;

    @Column()
    accountId?: string;

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
    reportItemKey!: string;

    @Column({ type: "varchar", length: 600, nullable: true })
    itemId!: string;


    @Column({ type: "varchar", length: 600, nullable: true })
    itemName!: string;

    @Column({ type: "varchar", length: 600, nullable: true })
    itemVariation!: string;

    @Column(BigintDbField)
    itemQuantity: number = 0;

    @Column(MoneyDbField)
    itemTotalAmount: number = 0;

    @Column(MoneyDbField)
    itemTaxAmount: number = 0;

    @Column(MoneyDbField)
    itemDiscountAmount: number = 0;

    @Column(MoneyDbField)
    itemComissionAmount: number = 0;



    @Column(BigintDbField)
    purchasedQuantity: number = 0;

    @Column(MoneyDbField)
    purchasedTotalAmount: number = 0;

    @Column(MoneyDbField)
    purchasedTaxAmount: number = 0;

    @Column(MoneyDbField)
    purchasedDiscountAmount: number = 0;

    @Column(MoneyDbField)
    purchasedComissionAmount: number = 0;


    @Column(BigintDbField)
    refundedQuantity: number = 0;

    @Column(MoneyDbField)
    refundedTotalAmount: number = 0;

    @Column(MoneyDbField)
    refundedTaxAmount: number = 0;

    @Column(MoneyDbField)
    refundedDiscountAmount: number = 0;

    @Column(MoneyDbField)
    refundedComissionAmount: number = 0;


    @Column({ type: 'datetime', default: () => 'CURRENT_TIMESTAMP', onUpdate: 'CURRENT_TIMESTAMP' })
    updatedAt!: Date;

    @Column({ type: 'datetime', default: () => 'CURRENT_TIMESTAMP' })
    createdAt!: Date;

    // TODO: Refundlar ve Purchase'leri ayır... şu anki alanları net olarak sakla

    // @Column({ type: "varchar", nullable: true })
    // itemClass?: string;

    // @Column({ type: "boolean", default: true })
    // totalExpense: boolean = true;

    // /**
    //  * Sıralama ağırlığı. 1 = toplam masraf (REPORT_TOTAL), 2 = komisyon/ödeme hizmeti
    //  * (PLATFORM_COMISSION_TOTAL, PAYMENT_SERVICE_FEE), 3 = ürün grubu komisyonları (ITEM_CLASS_COMISSION_*).
    //  * Frontend bu sıraya göre gösterir.
    //  */
    // @Column({ type: 'int', default: 2 })
    // displayWeight: number = 2;

    // // Zaten reportId'de var eğer çok lazım olursa ekleyebiliriz
    // // @Column({ type: "varchar", nullable: true })
    // // currency?: string;



    // static create(reportId: string, accountId: string, expenseKey: string, expenseAmount: number, itemClass?: string, totalExpense: boolean = true, displayWeight: number = 2): ReportExpense {
    //     const expense = new ReportExpense();
    //     expense.reportId = reportId;
    //     expense.accountId = accountId;
    //     expense.expenseKey = expenseKey;
    //     expense.expenseAmount = expenseAmount;
    //     expense.itemClass = itemClass;
    //     expense.totalExpense = totalExpense;
    //     expense.displayWeight = displayWeight;
    //     return expense;
    // }

    static generateKey(reportId: string, itemId: string, itemVariation: string): string {
        return reportId + "_" + itemId + "_" + itemVariation;
    }

    static create(reportId: string, itemId: string, itemName: string, itemVariation: string, itemAmount: number, itemTaxAmount: number, itemDiscountAmount: number, itemComissionAmount: number): ReportItem {
        const reportItem = new ReportItem();
        reportItem.reportItemKey = ReportItem.generateKey(reportId, itemId, itemVariation);
        reportItem.itemId = itemId;
        reportItem.itemName = itemName;
        reportItem.itemVariation = itemVariation;
        reportItem.itemTotalAmount = itemAmount;
        reportItem.itemTaxAmount = itemTaxAmount;
        reportItem.itemDiscountAmount = itemDiscountAmount;
        reportItem.itemComissionAmount = itemComissionAmount;
        return reportItem;
    }
}