import { Column, Entity, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';
import { Payment } from './payment.entity';

@Entity()
export class PostralPaymentItem {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @Column()
    entityGroup: string;
    
    @Column()
    entityId: string;
    
    @Column()
    entityName: string;
    
    @Column()
    quantity: number;
    
    @Column()
    totalAmount: number;
    
    @Column()
    unitAmount: number;
    
    @Column()
    taxPercent: number;

    @ManyToOne(() => Payment, (a) => a.items, {
        onDelete: 'CASCADE',
    })
    payment: Payment;
}
