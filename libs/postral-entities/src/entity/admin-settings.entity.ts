import { Column, Entity, JoinColumn, ManyToOne, PrimaryGeneratedColumn, Unique } from 'typeorm';
import { Account } from './account.entity';
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

    // Komisyonların hangi raporlama sorgusuna göre hesaplanacağını belirler.
    //  Admin tarafından seçilecek. 
    // Seçilen raporlama sorgusu, rapor digestion tarafından kullanılacak ve rapor digestion, 
    // komisyonları hesaplamak için bu sorguyu kullanacak.
    // Raporlama sorgusu DAILY (Günlük) olmalıdır. Yoksa gün gün hesaplamalar yapılamaz ve daha kod bakımı daha meşakatli olur.
    // Satıcıya komisyonu faturalandırma ve satıcının kazancını platforma göre hesaplama işlemi, 
    // rapor digestion tarafından yapılacak ve rapor digestion, komisyonları hesaplamak için bu 
    // sorguyu kullanacak. 


    @Column({ type: "uuid", nullable: true })
    comissionItemTaxId?: string;

    // Komisyonlarda kullanılacak vergi oranı. Admin tarafından seçilecek. Seçilen vergi oranı, ürünlerde kullanılan tax entitysi içerisinden seçilecek.
    @ManyToOne(() => ItemTaxEntity, { nullable: true, eager: true })
    @JoinColumn({ name: 'comissionItemTaxId' })
    comissionItemTax?: ItemTaxEntity;


    // Faturalandırma işlemleri için platformun kendi hesabı.
    // Komisyon ödemelerinde platform bu hesapla alacaklı, hakediş ödemelerinde borçlu olur.
    @Column({ type: 'uuid', nullable: true })
    billingAccountId?: string;

    @ManyToOne(() => Account, { nullable: true, eager: true })
    @JoinColumn({ name: 'billingAccountId' })
    billingAccount?: Account;

    // Fatura kesim günleri (ayın kaçında). Örnek: [1, 15] → her ayın 1'i ve 15'inde çalışır.
    // Seçilen günlerde önceki döneme ait faturalanmamış günlük raporlar toplanır.
    @Column({ type: 'simple-json', nullable: true })
    billingDays?: number[];

    @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
    createdAt: Date = new Date();

    @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
    updatedAt: Date = new Date();
}
