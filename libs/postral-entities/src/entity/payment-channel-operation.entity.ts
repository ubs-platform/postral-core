import { Column, Entity, Index, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';
import {
    PaymentOperationStatus,
    PaymentStatus,
} from '@tk-postral/payment-common';
import { MoneyDbField } from './base';

@Entity()
@Index(['paymentId', 'originalOperationId'], { unique: true })
export class PaymentChannelOperation {
    @PrimaryGeneratedColumn('uuid')
    id!: string;

    @Column()
    paymentChannelId!: string;

    @Column({ type: 'varchar', nullable: true })
    operationId!: string;

    @Column({ type: 'varchar', nullable: true })
    redirectUrl: string = '';

    // Ödeme sonrası tarayıcının dönmesi gereken frontend adresi (PaymentCaptureInfoDTO.redirectUrl)
    @Column({ type: 'varchar', length: 2048, nullable: true })
    returnUrl?: string | null;

    @Column(MoneyDbField)
    amount: number = 0;

    @Column({type: "varchar", nullable: false, default: "PURCHASE"})
    operationType: "PURCHASE" | "REFUND" = "PURCHASE";

    // hata verirse manuel kontrollere geçebiliriz...
    @Column({ type: 'varchar', nullable: false })
    currency!: string;

    @Column({ type: 'varchar', nullable: true })
    status: PaymentOperationStatus = "WAITING";

    @Column({ type: 'varchar', nullable: true })
    paymentId!: string;

    @Column({ type: 'varchar', nullable: true })
    originalOperationId?: string;

    @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
    createdAt: Date = new Date();

    @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP', onUpdate: 'CURRENT_TIMESTAMP' })
    updatedAt: Date = new Date();

    @Column(MoneyDbField)
    providerFee: number = 0;

    /**
     * Provider fee'nin kimin tarafından ödeneceği bilgisini tutar. 
     * Eğer "SELLER" ise satıcıdan, "PLATFORM" ise platformdan tahsil edilir. 
     * Bu bilgi, ödeme kanalının entegrasyonunda provider fee'nin nasıl işleneceği 
     * konusunda rehberlik eder. Örneğin, bazı ödeme kanalları provider fee'yi otomatik 
     * olarak tahsil ederken, bazıları manuel müdahale gerektirebilir. Bu alan sayesinde,
     * ödeme işlemi sırasında provider fee'nin doğru şekilde yönetilmesi sağlanır.
     */
    @Column({ type: "varchar", nullable: false, default: 'PLATFORM' })
    providerFeeDebitFrom: "SELLER" | "PLATFORM" = "PLATFORM";

    /**
     * Komisyon kesintisinin ödeme kanalının kesip kesmediği bilgisini tutar.
     * Eğer true ise, ödeme kanalı provider fee'yi tahsil eder ve kalan tutarı satıcıya öder.
     * Eğer false ise, ödeme kanalı provider fee'yi tahsil etmez ve satıcıya tam tutarı öder, sonradan provider tarafından tahsil edilir.
     */
    @Column({ type: 'boolean', default: false })
    feeCutInstantly: boolean = false;

}
