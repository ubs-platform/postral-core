import { Controller, Get, Query } from "@nestjs/common";
import { PaymentItemSearchService } from "../service/payment-item-search.service";
import { PaymentItemSearchDTO } from "@tk-postral/payment-common";

@Controller('payment-items')
export class PaymentItemSearchController {
    /**
     *
     */
    constructor(private paymentItemSearchService: PaymentItemSearchService) {
        
        
    }   

    @Get()
    async searchItems(@Query() query: PaymentItemSearchDTO) {
        return this.paymentItemSearchService.findItemsByCriteria(query);
    }
}