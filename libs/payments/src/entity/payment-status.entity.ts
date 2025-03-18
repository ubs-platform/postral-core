import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  OneToMany,
  ManyToOne,
  OneToOne,
} from 'typeorm';
import { PostralPaymentItem } from './payment-item.entity';
import { Payment } from './payment.entity';

@Entity()
export class PaymentProgress {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  status: 'COMPLETED' | 'WAITING' | 'EXPIRED';

  @Column()
  paidAmountIc: number;

  @Column()
  chargeBackAmountIc: number;

  //   paymentParts: PaymentPart[]

  /*
        {
            "paidAmountIc": 40000,
            "wrapper": 
        }
  */

  @OneToOne(() => Payment, (a) => a.progress)
  payment: Payment;
}
