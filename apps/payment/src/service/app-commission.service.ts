import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { AppComission } from '@tk-postral/postral-entities';
import { IsNull, Repository } from 'typeorm';
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


    async fetchOneForCalculation(sellerAccountId: string, itemClass: string, externalPlatformId?: string) {
        // Sağlanan boyutların hem spesifik hem de "genel" (null/boş) kombinasyonlarını üretiyoruz.
        // En spesifik tanım bias DESC ile ilk sırada gelir.
        const externalPlatformOptions = externalPlatformId
            ? [externalPlatformId, IsNull()]
            : [IsNull()];
        const sellerOptions = sellerAccountId
            ? [sellerAccountId, IsNull()]
            : [IsNull()];
        const itemClassOptions = itemClass ? [itemClass, ""] : [""];

        const where: any[] = [];
        for (const ep of externalPlatformOptions) {
            for (const sa of sellerOptions) {
                for (const ic of itemClassOptions) {
                    where.push({ externalPlatformId: ep, sellerAccountId: sa, itemClass: ic });
                }
            }
        }

        let entity = await this.appComissionRepo.findOne({
            where,
            order: {
                bias: 'DESC', // Öncelik sırasına göre sonuçları sıralayoruz, böylece en spesifik tanım ilk sırada olur
            },
            relations: ['sellerAccount', 'externalPlatform'],
        });
        if (!entity) {
            console.warn(`No commission definition found for sellerAccountId: ${sellerAccountId}, itemClass: ${itemClass}, externalPlatformId: ${externalPlatformId}. Returning with default 0`);
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
            ["sellerAccount", "externalPlatform"], // İlişkiler (relations) eklenebilir, eğer ihtiyaç varsa
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

    async removeById(id: string) {
        const entity = await this.appComissionRepo.findOneBy({ id });
        if (!entity) {
            throw new NotFoundException(`AppComission with ID ${id} not found`);
        }
        await this.appComissionRepo.remove(entity);
    }
}
