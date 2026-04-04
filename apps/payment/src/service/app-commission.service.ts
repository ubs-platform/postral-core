import { Injectable, NotFoundException, Post } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Payment } from '../entity/payment.entity';
import { Repository } from 'typeorm';
import { PostralPaymentItem } from '../entity/payment-item.entity';
import { PaymentMapper } from '../mapper/payment.mapper';
import { PaymentItemMapper } from '../mapper/payment-item.mapper';
import { TaxCalculationUtil } from '../util/calcs/tax-calculations';
import { PostralPaymentTax } from '../entity/payment-tax.entity';
import { EventSenderService } from './event-management.service';
import {
    PaymentItemDto,
    PaymentInitDTO,
    PaymentDTO,
    TaxDTO,
    AccountDTO,
} from '@tk-postral/payment-common';
import { Account } from '../entity/account.entity';
import { AccountMapper } from '../mapper/account.mapper';
import { NotFoundError } from 'rxjs';
import { AppComission } from '../entity/app-commission.entity';
import { AppComissionMapper } from '../mapper/app-comission.mapper';
import { AppComissionDTO } from '@tk-postral/payment-common/dto/app-comission.dto';
import { SearchRequest, SearchResult } from '@ubs-platform/crud-base-common';
import { TypeormSearchUtil } from './base/typeorm-search-util';

@Injectable()
export class AppComissionService {
    constructor(
        @InjectRepository(AppComission)
        private readonly appComissionRepo: Repository<AppComission>,
        private readonly appComissionMapper: AppComissionMapper,
    ) { }


    async fetchOneForCalculation(sellerAccountId: string, itemClass: string) {
        let entity = await this.appComissionRepo.findOne({
            where: [
                { itemClass, sellerAccountId },
                { itemClass, sellerAccountId: "" },
                { itemClass: "", sellerAccountId },
                { itemClass: "", sellerAccountId: "" },
            ],
            order: {
                bias: 'DESC', // Öncelik sırasına göre sonuçları sıralayoruz, böylece en spesifik tanım ilk sırada olur
            },
            relations: ['sellerAccount'],
        });
        if (!entity) {
            console.warn(`No commission definition found for sellerAccountId: ${sellerAccountId}, itemClass: ${itemClass}. Returning with default 0`);
            return { ...new AppComissionDTO(), "_warning": "No commission definition found. Returning with default 0" }; // Default olarak sıfır komisyon dönebiliriz
        }
        return this.appComissionMapper.toDto(entity);
    }


    // Admin tarafından, uygulama genelinde geçerli olacak komisyon oranlarını ve satıcıya özel komisyon oranlarını yönetmek için kullanılır. Satıcıya özel komisyon tanımlanmazsa, uygulama genelinde tanımlanan komisyon oranı geçerli olur. Ayrıca ürün sınıfına göre de farklı komisyon oranları tanımlanabilir. Ürün sınıfına özel tanımlama yoksa, satıcıya özel veya uygulama genelindeki tanımlamalar geçerli olur.
    async fetchAll(searchReq?: SearchRequest): Promise<SearchResult<AppComissionDTO>> {
        const search = (await TypeormSearchUtil.modelSearch(
            this.appComissionRepo,
            searchReq?.size || 10,
            searchReq?.page || 0,
            { bias: "asc" }, // Sıralama, önce itemClass'e göre, sonra sellerAccountId'ye göre olsun
            ["sellerAccount"], // İlişkiler (relations) eklenebilir, eğer ihtiyaç varsa
            {}
        ));

        return search.map(e => this.appComissionMapper.toDto(e));
    }

    async editOrCreate(dto: AppComissionDTO) {
        let entity: AppComission | null = null;
        if (dto.id) {
            entity = await this.appComissionRepo.findOneBy({ id: dto.id });
        }
        if (!entity) {
            entity = new AppComission();
        }
        entity = await this.appComissionMapper.updateEntity(entity, dto);
        await this.appComissionRepo.save(entity);
        return await this.appComissionMapper.toDto(entity);
    }


    async edit(dto: AppComissionDTO) {
        if (!dto.id) {
            throw new NotFoundException("ID is required");
        }
        let entity = await this.appComissionRepo.findOneBy({ id: dto.id });
        if (!entity) {
            throw new NotFoundException(`AppComission with ID ${dto.id} not found`);
        }
        entity = await this.appComissionMapper.updateEntity(entity, dto);
        await this.appComissionRepo.save(entity);
        return await this.appComissionMapper.toDto(entity);
    }
}
