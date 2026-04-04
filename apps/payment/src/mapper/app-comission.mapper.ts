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

        };
    }

    updateEntity(
        entity: AppComission,
        dto: AppComissionDTO,
    ): AppComission {
        const bias = (dto.sellerAccountId ? 1 : 0) + (dto.itemClass ? 1 : 0);

        entity.sellerAccountId = dto.sellerAccountId;
        entity.itemClass = dto.itemClass || "";
        entity.percent = dto.percent || 0;
        entity.bias = bias;
        return entity;
    }
}
