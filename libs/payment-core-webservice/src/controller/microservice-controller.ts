import { Controller } from "@nestjs/common";
import { MessagePattern } from "@nestjs/microservices";
import { RefundService } from "../service/refund.service";
import { RefundRequestDTO, StartSystemRefundDTO, SubMerchantSourceDTO } from "@tk-postral/payment-common";
import { SubMerchantSourceService } from "../service/sub-merchant-source.service";
// import { EOChannelConsts } from "@ubs-platform/user";
@Controller()
export class MicroserviceController {
    constructor(
        private readonly refundService: RefundService,
        private readonly subMerchantSourceService: SubMerchantSourceService,
    ) {}
    // @EventPattern("insert-user-capability")
    // async handleExampleEvent(data: any) {
    //     console.info(data)
    //     // exec(`kdialog --msgbox "Received event with data: ${JSON.stringify(data)}"`);
    // }
    // Controller methods would go here

    @MessagePattern("postral/payment/start-refund")
    async handleStartRefund(data: StartSystemRefundDTO): Promise<RefundRequestDTO> {
        return this.refundService.startRefundMicroservice(data);
    }

    @MessagePattern("postral/account/get-sub-merchant-source")
    async handleGetSubMerchantSource(accountId: string): Promise<SubMerchantSourceDTO> {
        return this.subMerchantSourceService.findByAccountId(accountId);
    }
}
