import {
    Column,
    Entity,
    Index,
    JoinColumn,
    ManyToOne,
    PrimaryGeneratedColumn,
    Unique,
} from 'typeorm';
import { ReportQuery } from './report-query.entity';
import { Report } from './report.entity';
import { Payment } from './payment.entity';
/**
 * One Report row = one aggregated period bucket for a ReportQuery.
 * Unique on (queryId, periodLabel, currency) so we never double-create.
 */
@Entity()
@Unique(['reportId', 'paymentId'])
export class ReportPaymentRelation {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @Column()
    paymentId: string;

    @Column()
    reportId: string;

    @ManyToOne(() => Payment, (p) => p.id, { onDelete: 'CASCADE', eager: false })
    @JoinColumn({ name: 'paymentId' })
    payment: Payment;

    @ManyToOne(() => Report, (r) => r.id, { onDelete: 'CASCADE', eager: true })
    @JoinColumn({ name: 'reportId' })
    report: Report;

    @Column({ nullable: true })
    digestionId: string;

    @Column({ nullable: true })
    digestionStartedAt: Date;

    /**
     * Report'ın hangi aşamada olduğunu gösterir. WAITING → henüz işlenmemiş, DIGESTING → işleniyor, COMPLETED → işlendi, FAILED → işlenirken hata oldu
     * Report oluşturulurken WAITING olur, sonra digestion başladığında DIGESTING olur, digestion başarılı olursa COMPLETED, hata olursa FAILED olur. DIGESTING ve FAILED durumlarında frontend'de yeniden digestion başlatmak için bir buton gösterilir.
     * Report'ın digestion durumunu tutmamızın sebebi, digestion işlemi uzun sürebileceği için frontend'in bu durumu bilerek kullanıcıya uygun bir geri bildirim verebilmesi ve gerektiğinde yeniden digestion başlatabilmesi içindir.
     * Ayrıca increase metodunun yetmediği durumlarda (veriyi bir anahtara göre gruplayarak toplama, çıkarma ya da ortalama vs. alma gibi durumlarda) 
     * digestion işlemi sırasında reportun digestion durumunu DIGESTING yaparak diğer işlemlerin 
     * diğer "WAITING" durumundaki reportlara müdahale etmesini engellemek ve digestion işlemi tamamlandıktan sonra durumunu COMPLETED yaparak diğer işlemlerin bu reporta müdahale etmesine izin vermek istiyoruz.
     */
    @Column()
    digestionStatus: "WAITING" | "DIGESTING" | "COMPLETED" | "FAILED";

    @Column({ type: 'datetime', default: () => 'CURRENT_TIMESTAMP', onUpdate: 'CURRENT_TIMESTAMP' })
    updatedAt: Date;

    @Column({ type: 'datetime', default: () => 'CURRENT_TIMESTAMP' })
    createdAt: Date;

    @Column({ type: 'datetime', nullable: true })
    digestionCompletedAt: Date;
}
