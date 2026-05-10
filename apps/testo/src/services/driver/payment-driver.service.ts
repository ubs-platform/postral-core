import { PaymentControllerService } from "../client/payment-controller.service";

export class PaymentDriverService {
    /**
     *
     */
    constructor(private readonly mainDriver: PaymentControllerService) { }

}