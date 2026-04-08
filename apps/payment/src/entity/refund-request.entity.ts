import {
    Entity,
    Column,
    PrimaryGeneratedColumn,
    OneToMany,
    BaseEntity,
    OneToOne,
    JoinColumn,
    ManyToOne,
} from 'typeorm';
import { RefundRequestItem } from './refund-request-item.entity';
import { Payment } from './payment.entity';

export type RefundRequestStatus = 'PENDING' | 'APPROVED' | 'REJECTED';

@Entity()
export class RefundRequest extends BaseEntity {
    @PrimaryGeneratedColumn('uuid')
    id!: string;

    /**
     * Purchase tipi payment'e referans. Bu, refund request'in hangi purchase payment'e ait olduğunu belirtir. Ancak, bu sadece bir referans ve gerçek payment bilgisi için Payment servisine sorgu atılması gerekebilir.
     */
    @Column()
    paymentId!: string;


    @Column({
        type: 'varchar',
        default: 'PENDING',
    })
    status!: RefundRequestStatus;

    @OneToMany(
        () => RefundRequestItem,
        (item: RefundRequestItem) => item.refundRequest,
        {
            cascade: true,
        },
    )
    items!: RefundRequestItem[];

    /**
     * UBS Users'teki kullanıcı idsi. Bu, refund request'i kimin oluşturduğunu ve kimin çözdüğünü takip etmek için kullanılabilir. Ancak, bu sadece bir referans ve gerçek kullanıcı bilgisi için UBS Users servisine sorgu atılması gerekebilir.
     */
    @Column()
    requestedByAccountId!: string;

    /**
     * Payment Account Id. Bu, refund request'i kimin oluşturduğunu takip etmek için kullanılabilir. 
     * Ancak, bu sadece bir referans ve gerçek account bilgisi için Payment Account servisine sorgu atılması gerekebilir.
     */
    @Column()
    requestedByPaymentAccountId!: string;

    /**
 * Payment Account Id. This, refund request'i kimin çözdüğünü takip etmek için kullanılabilir. Ancak, bu sadece bir referans ve gerçek account bilgisi için Payment Account servisine sorgu atılması gerekebilir.
 */
    @Column()
    requestedToPaymentAccountId!: string;



    /**
     * UBS Users'teki kullanıcı idsi. Bu, refund request'i kimin çözdüğünü takip etmek için kullanılabilir. Ancak, bu sadece bir referans ve gerçek kullanıcı bilgisi için UBS Users servisine sorgu atılması gerekebilir.
     */
    @Column({ nullable: true })
    resolvedByAccountId!: string;

    @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
    createdAt: Date = new Date();

    @Column({
        type: 'timestamp',
        default: () => 'CURRENT_TIMESTAMP',
        onUpdate: 'CURRENT_TIMESTAMP',
    })
    updatedAt: Date = new Date();
}
