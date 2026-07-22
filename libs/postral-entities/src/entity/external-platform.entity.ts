import { Column, Entity, PrimaryGeneratedColumn, Unique } from 'typeorm';

/*
Harici satış platformları (Hepsiburada, Trendyol, Amazon, Google Play Billing vb.).
Satıcı bu platformlarda satış yaptığında para platform tarafından tahsil edilir;
Postral yalnızca komisyon hesabı, faturalama ve raporlama için satışı kaydeder.
*/
@Entity()
@Unique(['code'])
export class ExternalPlatform {
    @PrimaryGeneratedColumn('uuid')
    id!: string;

    // Görünen ad, örn. "Hepsiburada"
    @Column()
    name: string = '';

    // Benzersiz kod, örn. HEPSIBURADA / TRENDYOL / AMAZON / GOOGLE_PLAY
    @Column()
    code: string = '';

    @Column({ default: true })
    active: boolean = true;

    @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
    createdAt: Date = new Date();

    @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
    updatedAt: Date = new Date();
}
