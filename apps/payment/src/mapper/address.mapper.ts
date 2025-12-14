import { AccountDTO, AddressDto } from '@tk-postral/payment-common';
import { Account } from '../entity/account.entity';
import { Inject, Injectable } from '@nestjs/common';
import { Address } from '../entity/address.entity';

@Injectable()
export class AddressMapper {
    async toDtoList(exist: Address[]): Promise<AddressDto[]> {
        const items: AddressDto[] = [];
        for (let index = 0; index < exist.length; index++) {
            const existAddress = exist[index];
            items.push(await this.toDto(existAddress));
        }
        return items;
    }

    async toDto(ac: Address): Promise<AddressDto> {
        return {
            id: ac.id,
            name: ac.name,
            streetName: ac.streetName,
            buildingNumber: ac.buildingNumber,
            cityName: ac.cityName,
            postalZone: ac.postalZone,
            countrySubentity: ac.countrySubentity,
            additionalStreetName: ac.additionalStreetName,
            district: ac.district,
            country: ac.country,
            citySubdivisionName: ac.citySubdivisionName,
            floor: ac.floor,
            room: ac.room,
            postbox: ac.postbox,
            region: ac.region,
            blockName: ac.blockName,
            buildingName: ac.buildingName,
            timezone: ac.timezone,
            plotIdentification: ac.plotIdentification,
            markCare: ac.markCare,
            markAttention: ac.markAttention,
            inhaleName: ac.inhaleName,
            addressFormatCode: ac.addressFormatCode,
            addressTypeCode: ac.addressTypeCode,
            cityCode: ac.cityCode,
            countrySubentityCode: ac.countrySubentityCode,
            department: ac.department,
        };
    }

    async updateEntity(entity: Address, dto: AddressDto): Promise<Address> {
        // existing.id = dto.id,
        entity.id = dto.id;
        entity.name = dto.name;
        entity.streetName = dto.streetName;
        entity.buildingNumber = dto.buildingNumber;
        entity.cityName = dto.cityName;
        entity.postalZone = dto.postalZone;
        entity.countrySubentity = dto.countrySubentity;
        entity.additionalStreetName = dto.additionalStreetName;
        entity.district = dto.district;
        entity.country = dto.country;
        entity.citySubdivisionName = dto.citySubdivisionName;
        entity.floor = dto.floor;
        entity.room = dto.room;
        entity.postbox = dto.postbox;
        entity.region = dto.region;
        entity.blockName = dto.blockName;
        entity.buildingName = dto.buildingName;
        entity.timezone = dto.timezone;
        entity.plotIdentification = dto.plotIdentification;
        entity.markCare = dto.markCare;
        entity.markAttention = dto.markAttention;
        entity.inhaleName = dto.inhaleName;
        entity.addressFormatCode = dto.addressFormatCode;
        entity.addressTypeCode = dto.addressTypeCode;
        entity.cityCode = dto.cityCode;
        entity.countrySubentityCode = dto.countrySubentityCode;
        entity.department = dto.department;
        return entity;
    }
}
