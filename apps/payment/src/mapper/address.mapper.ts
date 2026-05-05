import { AccountDTO, AccountAddressDto } from '@tk-postral/payment-common';
import { Account, Address } from '@tk-postral/postral-entities';
import { Inject, Injectable } from '@nestjs/common';
import { CryptionUtil } from '../util/cryption-util';

@Injectable()
export class AddressMapper {

    /**
     *
     */
    constructor(private cryptionUtil: CryptionUtil) {
        
    }
    async toDtoList(exist: Address[]): Promise<AccountAddressDto[]> {
        const items: AccountAddressDto[] = [];
        for (let index = 0; index < exist.length; index++) {
            const existAddress = exist[index];
            items.push(await this.toDto(existAddress));
        }
        return items;
    }

    async toDto(ac: Address): Promise<AccountAddressDto> {
        return {
            id: ac.id,
            name: ac.name,
            streetName: this.cryptionUtil.decryptWithConfig(ac.streetName, "USE_DEFAULT") || "",
            buildingNumber: this.cryptionUtil.decryptWithConfig(ac.buildingNumber, "USE_DEFAULT") || "",
            cityName: this.cryptionUtil.decryptWithConfig(ac.cityName, "USE_DEFAULT") || "",
            postalZone: this.cryptionUtil.decryptWithConfig(ac.postalZone, "USE_DEFAULT") || "",
            countrySubentity: this.cryptionUtil.decryptWithConfig(ac.countrySubentity, "USE_DEFAULT") || "",
            additionalStreetName: this.cryptionUtil.decryptWithConfig(ac.additionalStreetName, "USE_DEFAULT") || "",
            district: this.cryptionUtil.decryptWithConfig(ac.district, "USE_DEFAULT") || "",
            country: this.cryptionUtil.decryptWithConfig(ac.country, "USE_DEFAULT") || "",
            citySubdivisionName: this.cryptionUtil.decryptWithConfig(ac.citySubdivisionName, "USE_DEFAULT") || "",
            floor: this.cryptionUtil.decryptWithConfig(ac.floor, "USE_DEFAULT") || "",
            room: this.cryptionUtil.decryptWithConfig(ac.room, "USE_DEFAULT") || "",
            postbox: this.cryptionUtil.decryptWithConfig(ac.postbox, "USE_DEFAULT") || "",
            region: this.cryptionUtil.decryptWithConfig(ac.region, "USE_DEFAULT") || "",
            blockName: this.cryptionUtil.decryptWithConfig(ac.blockName, "USE_DEFAULT") || "",
            buildingName: this.cryptionUtil.decryptWithConfig(ac.buildingName, "USE_DEFAULT") || "",
            timezone: this.cryptionUtil.decryptWithConfig(ac.timezone, "USE_DEFAULT") || "",
            plotIdentification: this.cryptionUtil.decryptWithConfig(ac.plotIdentification, "USE_DEFAULT") || "",
            markCare: this.cryptionUtil.decryptWithConfig(ac.markCare, "USE_DEFAULT") || "",
            markAttention: this.cryptionUtil.decryptWithConfig(ac.markAttention, "USE_DEFAULT") || "",
            inhaleName: this.cryptionUtil.decryptWithConfig(ac.inhaleName, "USE_DEFAULT") || "",
            addressFormatCode: this.cryptionUtil.decryptWithConfig(ac.addressFormatCode, "USE_DEFAULT") || "",
            addressTypeCode: this.cryptionUtil.decryptWithConfig(ac.addressTypeCode, "USE_DEFAULT") || "",
            cityCode: this.cryptionUtil.decryptWithConfig(ac.cityCode, "USE_DEFAULT") || "",
            countrySubentityCode: this.cryptionUtil.decryptWithConfig(ac.countrySubentityCode, "USE_DEFAULT") || "",
            department: this.cryptionUtil.decryptWithConfig(ac.department, "USE_DEFAULT") || "",
        };
    }

    async updateEntity(entity: Address, dto: AccountAddressDto): Promise<Address> {
        // existing.id = dto.id,
        // entity.id = dto.id;
        entity.name = dto.name;
        entity.streetName = this.cryptionUtil.encryptWithConfig(dto.streetName, "USE_DEFAULT") || "";
        entity.buildingNumber = this.cryptionUtil.encryptWithConfig(dto.buildingNumber, "USE_DEFAULT") || "";
        entity.cityName = this.cryptionUtil.encryptWithConfig(dto.cityName, "USE_DEFAULT") || "";
        entity.postalZone = this.cryptionUtil.encryptWithConfig(dto.postalZone, "USE_DEFAULT") || "";
        entity.countrySubentity = this.cryptionUtil.encryptWithConfig(dto.countrySubentity, "USE_DEFAULT") || "";
        entity.additionalStreetName = this.cryptionUtil.encryptWithConfig(dto.additionalStreetName, "USE_DEFAULT") || "";
        entity.district = this.cryptionUtil.encryptWithConfig(dto.district, "USE_DEFAULT") || "";
        entity.country = this.cryptionUtil.encryptWithConfig(dto.country, "USE_DEFAULT") || "";
        entity.citySubdivisionName = this.cryptionUtil.encryptWithConfig(dto.citySubdivisionName, "USE_DEFAULT") || "";
        entity.floor = this.cryptionUtil.encryptWithConfig(dto.floor, "USE_DEFAULT") || "";
        entity.room = this.cryptionUtil.encryptWithConfig(dto.room, "USE_DEFAULT") || "";
        entity.postbox = this.cryptionUtil.encryptWithConfig(dto.postbox, "USE_DEFAULT") || "";
        entity.region = this.cryptionUtil.encryptWithConfig(dto.region, "USE_DEFAULT") || "";
        entity.blockName = this.cryptionUtil.encryptWithConfig(dto.blockName, "USE_DEFAULT") || "";
        entity.buildingName = this.cryptionUtil.encryptWithConfig(dto.buildingName, "USE_DEFAULT") || "";
        entity.timezone = this.cryptionUtil.encryptWithConfig(dto.timezone, "USE_DEFAULT") || "";
        entity.plotIdentification = this.cryptionUtil.encryptWithConfig(dto.plotIdentification, "USE_DEFAULT") || "";
        entity.markCare = this.cryptionUtil.encryptWithConfig(dto.markCare, "USE_DEFAULT") || "";
        entity.markAttention = this.cryptionUtil.encryptWithConfig(dto.markAttention, "USE_DEFAULT") || "";
        entity.inhaleName = this.cryptionUtil.encryptWithConfig(dto.inhaleName, "USE_DEFAULT") || "";
        entity.addressFormatCode = this.cryptionUtil.encryptWithConfig(dto.addressFormatCode, "USE_DEFAULT") || "";
        entity.addressTypeCode = this.cryptionUtil.encryptWithConfig(dto.addressTypeCode, "USE_DEFAULT") || "";
        entity.cityCode = this.cryptionUtil.encryptWithConfig(dto.cityCode, "USE_DEFAULT") || "";
        entity.countrySubentityCode = this.cryptionUtil.encryptWithConfig(dto.countrySubentityCode, "USE_DEFAULT") || "";
        entity.department = this.cryptionUtil.encryptWithConfig(dto.department, "USE_DEFAULT") || "";
        return entity;
    }
}
