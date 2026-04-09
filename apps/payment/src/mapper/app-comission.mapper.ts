import { AccountDTO } from '@tk-postral/payment-common';
import { Account } from '../entity/account.entity';
import { Inject, Injectable } from '@nestjs/common';
import { AppComission } from '../entity/app-commission.entity';
import { AppComissionDTO } from '@tk-postral/payment-common/dto/app-comission.dto';

@Injectable()
export class AppComissionMapper {
    async toDtoList(exist: AppComission[]): Promise<AppComissionDTO[]> {
        const items: AppComissionDTO[] = [];
        for (let index = 0; index < exist.length; index++) {
            const existAccount = exist[index];
            items.push(await this.toDto(existAccount));
        }
        return items;
    }

    toDto(ac: AppComission): AppComissionDTO {
        return {
            id: ac.id,
            itemClass: ac.itemClass,
            sellerAccountId: ac.sellerAccountId,
            sellerAccountName: ac.sellerAccount?.name,
            bias: ac.bias,
            percent: ac.percent,
            createdAt: ac.createdAt,
            updatedAt: ac.updatedAt,
        };
    }

    updateEntity(
        entity: AppComission,
        dto: AppComissionDTO,
    ): AppComission {
        let bias = 0; 
        if (dto.sellerAccountId && dto.itemClass) {
            bias = 4; // En spesifik tanım
        } else if (dto.sellerAccountId && !dto.itemClass) {
            bias = 3; // Satıcıya özel, ürün sınıfı genel
        } else if (!dto.sellerAccountId && dto.itemClass) {
            bias = 2; // Satıcı genel, ürün sınıfına özel
        } else {
            bias = 1; // En genel tanım
        }
            
        entity.sellerAccountId = dto.sellerAccountId;
        entity.itemClass = dto.itemClass || "";
        entity.percent = dto.percent || 0;
        entity.bias = bias;
        return entity;
    }
}
