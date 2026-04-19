import { Column, Entity, JoinColumn, ManyToOne, PrimaryGeneratedColumn, Unique } from 'typeorm';
import { Payment } from './payment.entity';
import { Account } from './account.entity';
import { BigintDbField } from './base';

@Entity()
@Unique(['sellerAccountId', 'itemClass'])
export class AppComission {
    @PrimaryGeneratedColumn('uuid')
    id!: string;

    /*
    Satıcı için ayrı bir tanımlama... boş ise defaulttur. Satıcıya özel tanımlama yapılırsa, o satıcı için geçerli olur. Satıcıya özel tanımlama yoksa, default tanımlama geçerli olur.
    */
    @Column({nullable: true})
    sellerAccountId?: string;

    @ManyToOne(() => Account, { nullable: true })
    @JoinColumn({ name: 'sellerAccountId' })
    sellerAccount?: Account;

    /* Ürün sınıfı için farklı komisyon oranı girilebilir. Null ise default komisyon oranı geçerli olur. */
    @Column({nullable: true})
    itemClass?: string;

    // 100 üzerinden yüzde olarak komisyon oranı
    @Column({type: 'float'})
    percent: number = 0;

    // Matematiksel işlemler yok ama konması bir zarar vermeyeceği için bigint olarak bıraktım.
    // Bu alan, aynı sellerAccountId ve itemClass için birden fazla kayıt varsa, hangi kaydın geçerli olduğunu belirlemek için kullanılır. Bias değeri en yüksek olan kayıt geçerli olur.
    @Column(BigintDbField)
    bias: number = 0;

    @Column({type: 'timestamp', default: () => 'CURRENT_TIMESTAMP'})
    createdAt: Date = new Date();

    @Column({type: 'timestamp', default: () => 'CURRENT_TIMESTAMP'})
    updatedAt: Date = new Date();

    // TODO: Ayrıca netten mi yoksa brütten mi hesapla seçeneği de ekleyebiliriz. Şimdilik brütten hesaplayacak şekilde yapalım.
}
