import { Controller } from "@nestjs/common";
import { EventPattern, MessagePattern } from "@nestjs/microservices";
import { EntityOwnershipGroupCommonDTO } from "@ubs-platform/users-common";
import { exec } from "child_process";
// import { EOChannelConsts } from "@ubs-platform/user";
@Controller()
export class MicroserviceController {
    @EventPattern("insert-user-capability")
    async handleExampleEvent(data: any) {
        console.info(data)
        exec(`kdialog --msgbox "Received event with data: ${JSON.stringify(data)}"`);
    }
    // Controller methods would go here
}