import { Entity, Column, PrimaryGeneratedColumn, OneToMany } from 'typeorm';
import { PaymentItemDto } from './payment-item.dto';
import { PaymentItemInputDto } from './payment-item-input.dto';

export interface PaymentInitDTO {
    // id: string;

    type: 'PURCHASE' | 'REFUND';
    totalAmount: number;

    /**
     * Euro (€ or EUR), US Dollars($ or USD), Turkish Lira (₺ or TRY), etc...
     */
    unit: string;

    items: PaymentItemInputDto[];
}
