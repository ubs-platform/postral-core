import { Body, Controller, Get, Post } from "@nestjs/common";
import { CalculationService } from "../service/calculation.service";
import { ItemListCalculationDto, ItemListCalculationInputDto } from "@tk-postral/payment-common/dto/calculation.dto";

@Controller('calculation')
export class CalculationController {
    // The controller is intentionally left empty as the calculation logic is handled in the service layer.
    /**
     *
     */
    constructor(private readonly calculationService: CalculationService
    ) {

    }

    @Post('/total-amount')
    public async calculateTotalAmount(@Body() body: ItemListCalculationInputDto): Promise<ItemListCalculationDto> {
        return await this.calculationService.calculateTotalAmount(body);
    }
}