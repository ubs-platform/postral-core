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

    async toDto(ac: AppComission): Promise<AppComissionDTO> {
        return {
            id: ac.id,
            applicationAccountId: ac.applicationAccountId,
            default: ac.default,
            sellerAccountId: ac.sellerAccountId,
            percent: ac.percent,
        };
    }

    async updateEntity(
        entity: AppComission,
        dto: AppComissionDTO,
    ): Promise<AppComission> {
        // existing.id = dto.id,

        entity.applicationAccountId = dto.applicationAccountId;
        entity.default = dto.default;
        entity.sellerAccountId = dto.sellerAccountId || "";
        entity.percent = dto.percent || 0;

        return entity;
    }
}
