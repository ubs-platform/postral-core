import { PaymentItemInputDto } from "./payment-item-input.dto";
import { PaymentItemDto } from "./payment-item.dto";
import { TaxDTO } from "./tax.dto";

export class ItemListCalculationInputDto {
    /**
     *
     */
    constructor(public items: PaymentItemInputDto[], public saleMode: string, public currency: string) {

    }
}

export class ItemListCalculationDto {
    /**
     *
     */
    constructor(public items: PaymentItemDto[], public totalAmount: number, public totalTaxAmount: number, public taxes: TaxDTO[]) {

    }
}
