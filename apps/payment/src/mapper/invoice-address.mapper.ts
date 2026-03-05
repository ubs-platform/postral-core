import { Injectable } from '@nestjs/common';
import { InvoiceAddressDto } from '@tk-postral/payment-common';
import { InvoiceAddress } from '../entity/invoice-address.entity';
import { Address } from '../entity';

@Injectable()
export class InvoiceAddressMapper {

    toEntityFromAccountAddress(acad: Address): InvoiceAddress {
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