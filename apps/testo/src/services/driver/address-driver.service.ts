import { Injectable } from "@nestjs/common";
import { AddressControllerService } from "../client/address-controller.service";
import { AccountAddressDto } from "@tk-postral/payment-common";

@Injectable()
export class AddressDriverService {
    constructor(private readonly addressController: AddressControllerService) {}

    async setup(): Promise<AccountAddressDto> {
        const adres = await this.addressController.add({
            cityName: "İSTANBUL",
            citySubdivisionName: "BEYOĞLU",
            country: "TÜRKİYE",
            name: "Ana adres",
            postalZone: "34440",
            streetName: "Akarsu Yokuş Sokak 3/4 😽",
        });
        console.info("Adres oluşturuldu:", adres.id);
        return adres;
    }
}
