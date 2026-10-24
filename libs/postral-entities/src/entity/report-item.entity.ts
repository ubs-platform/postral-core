import { Column, Entity, PrimaryGeneratedColumn, Unique } from "typeorm";
import { BigintDbField, MoneyDbField } from "./base";
import { createHash } from "crypto";

@Entity("report_item")
@Unique(["reportId", "accountId", "reportItemKey"])
export class ReportItem {
    @PrimaryGeneratedColumn('uuid')
    id!: string;

    @Column()
    reportId!: string;

    @Column()
    accountId?: string;

    /** Product identity within a report/account, using the name when no catalog ID exists. */
    @Column({ type: "varchar", length: 600, nullable: true })
    reportItemKey!: string;

    @Column({ type: "varchar", length: 600, nullable: true })
    itemId!: string;

    @Column({ default: false })
    identifiedByName: boolean = false;

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

    static generateKey(reportId: string, itemId: string | null | undefined, itemVariation: string | null | undefined, itemName?: string): string {
        if (itemId?.trim()) {
            // Retain existing catalog-ID keys so active reports keep accumulating in the same rows.
            return reportId + "_" + itemId + "_" + itemVariation;
        }
        const name = itemName?.trim().replace(/\s+/g, " ").toLowerCase();
        if (!name) {
            throw new Error(`Report ${reportId} contains an item without an ID or name`);
        }
        const identity = createHash("sha256").update(JSON.stringify([name, itemVariation ?? ""])).digest("hex");
        return reportId + ":no-id:" + identity;
    }

    static create(reportId: string, itemId: string, itemName: string, itemVariation: string, itemAmount: number, itemTaxAmount: number, itemDiscountAmount: number, itemComissionAmount: number): ReportItem {
        const reportItem = new ReportItem();
        reportItem.reportItemKey = ReportItem.generateKey(reportId, itemId, itemVariation, itemName);
        reportItem.reportId = reportId;
        reportItem.itemId = itemId;
        reportItem.identifiedByName = !itemId?.trim();
        reportItem.itemName = itemName;
        reportItem.itemVariation = itemVariation;
        reportItem.itemTotalAmount = itemAmount;
        reportItem.itemTaxAmount = itemTaxAmount;
        reportItem.itemDiscountAmount = itemDiscountAmount;
        reportItem.itemComissionAmount = itemComissionAmount;
        return reportItem;
    }
}