import { Injectable } from "@nestjs/common";
import { AppComissionControllerService } from "../client/app-comission-controller.service";

@Injectable()
export class CommissionDriverService {
    constructor(private readonly platformComission: AppComissionControllerService) {}

    async setup() {
        const reducedClass = "reduced";
        await Promise.all([
            this.platformComission.update({ percent: 10, bias: 0, id: "default" }),
            this.platformComission.update({ percent: 5, bias: 0, itemClass: reducedClass, id: reducedClass }),
        ]);
        console.info("Komisyonlar ayarlandı: default=%10, reduced=%5");
    }
}
