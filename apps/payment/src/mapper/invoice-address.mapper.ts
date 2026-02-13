import { Injectable } from '@nestjs/common';
import { InvoiceAddressDto } from '@tk-postral/payment-common';
import { InvoiceAddress } from '../entity/invoice-address.entity';

@Injectable()
export class InvoiceAddressMapper {
    toDto(entity: InvoiceAddress): InvoiceAddressDto {
        return {
            id: entity.id,
            name: entity.name,
            buildingNumber: entity.buildingNumber,
            buildingName: entity.buildingName,
            room: entity.room,
            floor: entity.floor,
            blockName: entity.blockName,
            streetName: entity.streetName,
            additionalStreetName: entity.additionalStreetName,
            district: entity.district,
            citySubdivisionName: entity.citySubdivisionName,
            cityName: entity.cityName,
            postalZone: entity.postalZone,
            region: entity.region,
            postbox: entity.postbox,
            country: entity.country,
            countrySubentity: entity.countrySubentity,
            countrySubentityCode: entity.countrySubentityCode,
            addressFormatCode: entity.addressFormatCode,
            addressTypeCode: entity.addressTypeCode,
            department: entity.department,
            markAttention: entity.markAttention,
            markCare: entity.markCare,
            plotIdentification: entity.plotIdentification,
            cityCode: entity.cityCode,
            inhaleName: entity.inhaleName,
            timezone: entity.timezone,
        };
    }

    toEntity(dto: InvoiceAddressDto): InvoiceAddress {
        const entity = new InvoiceAddress();
        if (dto.id) {
            entity.id = dto.id;
        }
        entity.name = dto.name;
        entity.buildingNumber = dto.buildingNumber;
        entity.buildingName = dto.buildingName;
        entity.room = dto.room;
        entity.floor = dto.floor;
        entity.blockName = dto.blockName;
        entity.streetName = dto.streetName;
        entity.additionalStreetName = dto.additionalStreetName;
        entity.district = dto.district;
        entity.citySubdivisionName = dto.citySubdivisionName;
        entity.cityName = dto.cityName;
        entity.postalZone = dto.postalZone;
        entity.region = dto.region;
        entity.postbox = dto.postbox;
        entity.country = dto.country;
        entity.countrySubentity = dto.countrySubentity;
        entity.countrySubentityCode = dto.countrySubentityCode;
        entity.addressFormatCode = dto.addressFormatCode;
        entity.addressTypeCode = dto.addressTypeCode;
        entity.department = dto.department;
        entity.markAttention = dto.markAttention;
        entity.markCare = dto.markCare;
        entity.plotIdentification = dto.plotIdentification;
        entity.cityCode = dto.cityCode;
        entity.inhaleName = dto.inhaleName;
        entity.timezone = dto.timezone;
        return entity;
    }
}