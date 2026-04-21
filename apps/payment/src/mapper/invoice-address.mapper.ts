import { Injectable } from '@nestjs/common';
import { InvoiceAddressDto } from '@tk-postral/payment-common';
import { InvoiceAddress } from '../entity/invoice-address.entity';
import { Address } from '../entity';
import { CryptionUtil } from '../util/cryption-util';

@Injectable()
export class InvoiceAddressMapper {

    constructor(private cryptionUtil: CryptionUtil) { }

    toEntityFromAccountAddress(acad: Address): InvoiceAddress {
        // Şifrelenmiş alanlar zaten şifreli geliyor, o yüzden direkt atama yapabiliriz
        const entity = new InvoiceAddress();
        entity.name = acad.name;
        entity.buildingNumber = acad.buildingNumber;
        entity.buildingName = acad.buildingName;
        entity.room = acad.room;
        entity.floor = acad.floor;
        entity.blockName = acad.blockName;
        entity.streetName = acad.streetName;
        entity.additionalStreetName = acad.additionalStreetName;
        entity.district = acad.district;
        entity.citySubdivisionName = acad.citySubdivisionName;
        entity.cityName = acad.cityName;
        entity.postalZone = acad.postalZone;
        entity.region = acad.region;
        entity.postbox = acad.postbox;
        entity.country = acad.country;
        entity.countrySubentity = acad.countrySubentity;
        entity.countrySubentityCode = acad.countrySubentityCode;
        entity.addressFormatCode = acad.addressFormatCode;
        entity.addressTypeCode = acad.addressTypeCode;
        entity.department = acad.department;
        entity.markAttention = acad.markAttention;
        entity.markCare = acad.markCare;
        entity.plotIdentification = acad.plotIdentification;
        entity.cityCode = acad.cityCode;
        entity.inhaleName = acad.inhaleName;
        entity.timezone = acad.timezone;
        return entity;
    }

    toDto(entity: InvoiceAddress): InvoiceAddressDto {
        return {
            id: entity.id,
            name: entity.name,
            buildingNumber: this.cryptionUtil.decryptWithConfig(entity.buildingNumber, "USE_DEFAULT") || "",
            buildingName: this.cryptionUtil.decryptWithConfig(entity.buildingName, "USE_DEFAULT") || "",
            room: this.cryptionUtil.decryptWithConfig(entity.room, "USE_DEFAULT") || "",
            floor: this.cryptionUtil.decryptWithConfig(entity.floor, "USE_DEFAULT") || "",
            blockName: this.cryptionUtil.decryptWithConfig(entity.blockName, "USE_DEFAULT") || "",
            streetName: this.cryptionUtil.decryptWithConfig(entity.streetName, "USE_DEFAULT") || "",
            additionalStreetName: this.cryptionUtil.decryptWithConfig(entity.additionalStreetName, "USE_DEFAULT") || "",
            district: this.cryptionUtil.decryptWithConfig(entity.district, "USE_DEFAULT") || "",
            citySubdivisionName: this.cryptionUtil.decryptWithConfig(entity.citySubdivisionName, "USE_DEFAULT") || "",
            cityName: this.cryptionUtil.decryptWithConfig(entity.cityName, "USE_DEFAULT") || "",
            postalZone: this.cryptionUtil.decryptWithConfig(entity.postalZone, "USE_DEFAULT") || "",
            region: this.cryptionUtil.decryptWithConfig(entity.region, "USE_DEFAULT") || "",
            postbox: this.cryptionUtil.decryptWithConfig(entity.postbox, "USE_DEFAULT") || "",
            country: this.cryptionUtil.decryptWithConfig(entity.country, "USE_DEFAULT") || "",
            countrySubentity: this.cryptionUtil.decryptWithConfig(entity.countrySubentity, "USE_DEFAULT") || "",
            countrySubentityCode: this.cryptionUtil.decryptWithConfig(entity.countrySubentityCode, "USE_DEFAULT") || "",
            addressFormatCode: this.cryptionUtil.decryptWithConfig(entity.addressFormatCode, "USE_DEFAULT") || "",
            addressTypeCode: this.cryptionUtil.decryptWithConfig(entity.addressTypeCode, "USE_DEFAULT") || "",
            department: this.cryptionUtil.decryptWithConfig(entity.department, "USE_DEFAULT") || "",
            markAttention: this.cryptionUtil.decryptWithConfig(entity.markAttention, "USE_DEFAULT") || "",
            markCare: this.cryptionUtil.decryptWithConfig(entity.markCare, "USE_DEFAULT") || "",
            plotIdentification: this.cryptionUtil.decryptWithConfig(entity.plotIdentification, "USE_DEFAULT") || "",
            cityCode: this.cryptionUtil.decryptWithConfig(entity.cityCode, "USE_DEFAULT") || "",
            inhaleName: this.cryptionUtil.decryptWithConfig(entity.inhaleName, "USE_DEFAULT") || "",
            timezone: this.cryptionUtil.decryptWithConfig(entity.timezone, "USE_DEFAULT") || "",
        };
    }

    toEntity(dto: InvoiceAddressDto): InvoiceAddress {
        const entity = new InvoiceAddress();
        if (dto.id) {
            entity.id = dto.id;
        }
        entity.name = dto.name;
        entity.buildingNumber = this.cryptionUtil.encryptWithConfig(dto.buildingNumber, "USE_DEFAULT") || "";
        entity.buildingName = this.cryptionUtil.encryptWithConfig(dto.buildingName, "USE_DEFAULT") || "";
        entity.room = this.cryptionUtil.encryptWithConfig(dto.room, "USE_DEFAULT") || "";
        entity.floor = this.cryptionUtil.encryptWithConfig(dto.floor, "USE_DEFAULT") || "";
        entity.blockName = this.cryptionUtil.encryptWithConfig(dto.blockName, "USE_DEFAULT") || "";
        entity.streetName = this.cryptionUtil.encryptWithConfig(dto.streetName, "USE_DEFAULT") || "";
        entity.additionalStreetName = this.cryptionUtil.encryptWithConfig(dto.additionalStreetName, "USE_DEFAULT") || "";
        entity.district = this.cryptionUtil.encryptWithConfig(dto.district, "USE_DEFAULT") || "";
        entity.citySubdivisionName = this.cryptionUtil.encryptWithConfig(dto.citySubdivisionName, "USE_DEFAULT") || "";
        entity.cityName = this.cryptionUtil.encryptWithConfig(dto.cityName, "USE_DEFAULT") || "";
        entity.postalZone = this.cryptionUtil.encryptWithConfig(dto.postalZone, "USE_DEFAULT") || "";
        entity.region = this.cryptionUtil.encryptWithConfig(dto.region, "USE_DEFAULT") || "";
        entity.postbox = this.cryptionUtil.encryptWithConfig(dto.postbox, "USE_DEFAULT") || "";
        entity.country = this.cryptionUtil.encryptWithConfig(dto.country, "USE_DEFAULT") || "";
        entity.countrySubentity = this.cryptionUtil.encryptWithConfig(dto.countrySubentity, "USE_DEFAULT") || "";
        entity.countrySubentityCode = this.cryptionUtil.encryptWithConfig(dto.countrySubentityCode, "USE_DEFAULT") || "";
        entity.addressFormatCode = this.cryptionUtil.encryptWithConfig(dto.addressFormatCode, "USE_DEFAULT") || "";
        entity.addressTypeCode = this.cryptionUtil.encryptWithConfig(dto.addressTypeCode, "USE_DEFAULT") || "";
        entity.department = this.cryptionUtil.encryptWithConfig(dto.department, "USE_DEFAULT") || "";
        entity.markAttention = this.cryptionUtil.encryptWithConfig(dto.markAttention, "USE_DEFAULT") || "";
        entity.markCare = this.cryptionUtil.encryptWithConfig(dto.markCare, "USE_DEFAULT") || "";
        entity.plotIdentification = this.cryptionUtil.encryptWithConfig(dto.plotIdentification, "USE_DEFAULT") || "";
        entity.cityCode = this.cryptionUtil.encryptWithConfig(dto.cityCode, "USE_DEFAULT") || "";
        entity.inhaleName = this.cryptionUtil.encryptWithConfig(dto.inhaleName, "USE_DEFAULT") || "";
        entity.timezone = this.cryptionUtil.encryptWithConfig(dto.timezone, "USE_DEFAULT") || "";
        return entity;
    }
}