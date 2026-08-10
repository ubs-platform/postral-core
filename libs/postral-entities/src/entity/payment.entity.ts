import {
    Entity,
    Column,
    PrimaryGeneratedColumn,
    OneToMany,
    OneToOne,
    ManyToOne,
    JoinColumn,
} from 'typeorm';
import { PostralPaymentItem } from './payment-item.entity';
import { PostralPaymentTax } from './payment-tax.entity';
import { PaymentErrorStatus, PaymentStatus } from '@tk-postral/payment-common';
import { RefundRequest } from './refund-request.entity';
import { ReportPaymentRelation } from './report-payment-relation.entity';
import { MoneyDbField } from './base';
import { Account } from './account.entity';
import { Address } from './address.entity';
import { ExternalPlatform } from './external-platform.entity';
import { SnapshotAccount } from './snapshot-account.entity';
import { SnapshotAddress } from './snapshot-address.entity';

@Entity()
export class Payment {
    @PrimaryGeneratedColumn('uuid')
    id!: string;

    @Column({ length: 200, type: 'varchar', nullable: true, unique: true })
    billingCode!: string;

    @Column()
    type!: 'PURCHASE' | 'REFUND';

    @Column(MoneyDbField)
    totalAmount!: number;

    @Column(MoneyDbField)
    taxAmount!: number;
    /**
     * Euro (€ or EUR), US Dollars($ or USD), Turkish Lira (₺ or TRY), etc...
     */
    @Column()
    currency!: string;

    @OneToMany(() => PostralPaymentItem, (item) => item.payment, {
        cascade: true,
    })
    items!: PostralPaymentItem[];

    @OneToMany(() => PostralPaymentTax, (item) => item.payment, {
        cascade: true,
    })
    taxes!: PostralPaymentTax[];

    @Column({ nullable: true })
    customerAccountId?: string;

    // Satış anındaki faturalama adresi; müşterinin sonradan değiştirdiği defaultAddress'ten bağımsız kalır.
    @Column({ nullable: true })
    billingAddressId?: string;

    @ManyToOne(() => Address, { eager: false, nullable: true })
    @JoinColumn({ name: 'billingAddressId' })
    billingAddress?: Address;

    @ManyToOne(() => Account, { eager: true, nullable: true })
    @JoinColumn({ name: 'customerAccountId' })
    customerAccount?: Account;

    @Column({ nullable: true })
    customerSnapshotAddressId?: string;

    @OneToOne(() => SnapshotAddress, { cascade: true })
    @JoinColumn({ name: 'customerSnapshotAddressId' })
    customerSnapshotAddress?: SnapshotAddress;

    @Column({ nullable: true })
    customerSnapshotAccountId?: string;

    @OneToOne(() => SnapshotAccount, { cascade: true })
    @JoinColumn({ name: 'customerSnapshotAccountId' })
    customerSnapshotAccount?: SnapshotAccount;

    @Column({ type: 'varchar' })
    paymentStatus!: PaymentStatus;

    @Column({ type: 'varchar', nullable: true })
    errorStatus!: PaymentErrorStatus;

    /**
     * Nakit, Kredi Kartı, Havale/EFT, vs...
     */
    @Column({ nullable: true })
    paymentChannelId!: string;

    @Column({ nullable: true })
    paymentChannelOperationId!: string;

    @Column({ nullable: true })
    paymentChannelOperationUrl!: string;

    @Column({ nullable: true })
    channelUrlExpiryDate!: Date;

    @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
    createdAt!: Date;

    @Column({
        type: 'timestamp',
        default: () => 'CURRENT_TIMESTAMP',
        onUpdate: 'CURRENT_TIMESTAMP',
    })
    updatedAt!: Date;

    @OneToMany(() => PostralPaymentItem, (item) => item.refundPayment, {
        cascade: true,
    })
    refundItems!: PostralPaymentItem[];

    @Column({ nullable: true })
    refundRequestId?: string;

    @OneToMany(() => ReportPaymentRelation, (rpr) => rpr.payment, { eager: false })
    reportPaymentRelations!: ReportPaymentRelation[];

    // Raporlara dahil edilsin mi diye kontrol için eklendi, digestion sırasında includeInReportDigestion = false olan raporlar atlanacak.
    @Column({ default: true })
    includeInReportDigestion: boolean = true;

    // Açık fatura: ödeme tamamlanmaz ancak güven ilişkisiyle tamamlanmış sayılır. Satıcı onayıyla kapatılır.
    @Column({ default: false })
    openPayment: boolean = false;

    // Harici satış platformu (Hepsiburada, Trendyol vb.). Boş ise Postral üzerinden yapılan normal satıştır.
    @Column({ nullable: true })
    externalPlatformId?: string;

    @ManyToOne(() => ExternalPlatform, { nullable: true })
    @JoinColumn({ name: 'externalPlatformId' })
    externalPlatform?: ExternalPlatform;

    // Harici platformdaki sipariş kimliği (dış referans)
    @Column({ nullable: true })
    externalPlatformOrderId?: string;
    /**
     * Aktif oturum idsi, eğer bir payment başlatıldıysa ve henüz tamamlanmadıysa, bu payment ile ilişkilendirilmiş oturumun idsi burada tutulur. Bu sayede bir kullanıcı aynı anda birden fazla ödeme başlatamaz.
     */
    @Column({ nullable: true })
    activeSessionId?: string;

    /**
     * Eğer bir ödeme kanalı başarısız olursa, payment hemen failed ya da initiated durumuna düşmesini ayarlamak için bu alan kullanılır. Ödeme kanalı başarısız olursa, paymentService bu alanı true yapar ve paymentStatus'ü failed yapar. Eğer false ise, paymentStatus initiated olarak kalır ve kullanıcıya tekrar ödeme kanalı seçme şansı verilir.
     * 
     */
    @Column({ default: false })
    failOnPaymentChannelFailure: boolean = false;

    get customerAccountName(): string {
        return this.customerAccount ? this.customerAccount.name : '';
    }
}
