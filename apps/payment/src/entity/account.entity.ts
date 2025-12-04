import { Column, Entity, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';
import { Payment } from './payment.entity';

@Entity()
export class Account {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @Column()
    name: string;

    @Column()
    legalIdentity: string;

    @Column()
    type: 'INDIVIDUAL' | 'COMMERCIAL';

    // EO APIsi yerine burada ownerUserId ve eogId kullanabiliriz. Çünkü EO biraz karmaşık bir yapı ve Account
    // devredilen bir yapıdan çok kişisel bir yapı... Bir müşterinin kendi hesabı
    @Column({ nullable: true, type: "varchar" })
    ownerUserId?: string;

    @Column({ nullable: true, type: "varchar" })
    entityOwnershipGroupId?: string;

}
