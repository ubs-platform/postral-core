import { Account } from './account.entity';
import { AppComission } from './app-commission.entity';
import { Item } from './item.entity';
import { PostralPaymentItem } from './payment-item.entity';
import { PaymentProgress } from './payment-status.entity';
import { PostralPaymentTax } from './payment-tax.entity';
import { Payment } from './payment.entity';

export * from './payment-item.entity';
export * from './payment-status.entity';
export * from './payment.entity';
export * from './account.entity';
export * from './app-commission.entity';
export * from './payment-tax.entity';
export * from './payment.entity';

export const PaymentsEntities = [
    PostralPaymentItem,
    PaymentProgress,
    Payment,
    PostralPaymentTax,
    AppComission,
    Account,
    Item,
];
