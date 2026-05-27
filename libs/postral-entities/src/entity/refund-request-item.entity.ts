import {
    Entity,
    Column,
    PrimaryGeneratedColumn,
    ManyToOne,
    BaseEntity,
} from 'typeorm';
import { RefundRequest } from './refund-request.entity';
import { MoneyDbField } from './base';
import Big = require('big.js');

@Entity()
export class RefundRequestItem extends BaseEntity {
    @PrimaryGeneratedColumn('uuid')
    id!: string;

    @ManyToOne(() => RefundRequest, (request) => request.items, {
        onDelete: 'CASCADE',
    })
    refundRequest!: RefundRequest;

    @Column()
    variation!: string;

    @Column()
    paymentItemId!: string;

    @Column()
    realItemId!: string;

    @Column(MoneyDbField)
    refundCount: number | Big = 0;

    @Column({ nullable: true })
    itemName?: string;

    @Column(MoneyDbField)
    unitAmount?: number | Big = 0;

    @Column(MoneyDbField)
    unitAmountWithoutTax?: number | Big = 0;

    @Column(MoneyDbField)
    refundAmount: number | Big = 0;

    @Column(MoneyDbField)
    refundAmountWithoutTax: number | Big = 0;

    @Column(MoneyDbField)
    refundTaxAmount?: number | Big = 0;
    
    @Column()
    itemClass: string = "";

    @Column(MoneyDbField)
    appComissionAmount: number | Big = 0;

    @Column(MoneyDbField)
    appComissionPercent: number | Big = 0;

}
