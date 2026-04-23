import { Column, Entity, JoinColumn, ManyToOne, PrimaryGeneratedColumn, Unique } from 'typeorm';
import { Payment } from './payment.entity';
import { Account } from './account.entity';
import { ReportQuery } from './report-query.entity';
import { ItemTaxEntity } from './item-tax.entity';

@Entity()
export class AdminSettings {
    @PrimaryGeneratedColumn('uuid')
    id!: string;

    /**
     * Ödeme altyapısı ücretlerini satıcıya yansıtır. İğrenç bir özellik ama isteyenler olabilir...
     * TODO: Özellik implement edilecek
     * 
     */
    @Column({ type: "boolean", default: false })
    sellerPaysPaymentServiceFee: boolean = false;

    /**
     * Eğer true ise net gelir üzerinden komisyon hesaplanır, false ise brüt gelir üzerinden hesaplanır. 
     */
    @Column({ type: "boolean", default: false })
    comissionsCalculatedFromNet: boolean = false;

    @Column({ type: "uuid", nullable: true })
    reportQueryId?: string;

    // Komisyonların hangi raporlama sorgusuna göre hesaplanacağını belirler.
    //  Admin tarafından seçilecek. 
    // Seçilen raporlama sorgusu, rapor digestion tarafından kullanılacak ve rapor digestion, 
    // komisyonları hesaplamak için bu sorguyu kullanacak.
    // Raporlama sorgusu DAILY (Günlük) olmalıdır. Yoksa gün gün hesaplamalar yapılamaz ve daha kod bakımı daha meşakatli olur.
    // Satıcıya komisyonu faturalandırma ve satıcının kazancını platforma göre hesaplama işlemi, 
    // rapor digestion tarafından yapılacak ve rapor digestion, komisyonları hesaplamak için bu 
    // sorguyu kullanacak. 
    @ManyToOne(() => ReportQuery, { nullable: true, eager: false })
    @JoinColumn({ name: 'reportQueryId' })
    reportQuery?: ReportQuery;

    @Column({ type: "uuid", nullable: true })
    comissionItemTaxId?: string;

    // Komisyonlarda kullanılacak vergi oranı. Admin tarafından seçilecek. Seçilen vergi oranı, ürünlerde kullanılan tax entitysi içerisinden seçilecek.
    @ManyToOne(() => ItemTaxEntity, { nullable: true, eager: false })
    @JoinColumn({ name: 'comissionItemTaxId' })
    comissionItemTax?: ItemTaxEntity;


    @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
    createdAt: Date = new Date();

    @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
    updatedAt: Date = new Date();
}
