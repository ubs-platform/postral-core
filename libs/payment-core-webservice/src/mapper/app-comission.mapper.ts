import { AccountDTO } from '@tk-postral/payment-common';
import { Account, AppComission } from '@tk-postral/postral-entities';
import { Inject, Injectable } from '@nestjs/common';
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
            externalPlatformId: ac.externalPlatformId,
            externalPlatformName: ac.externalPlatform?.name,
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
        // En spesifik tanımın öne gelmesi için bitmask tabanlı bias:
        // externalPlatformId(4) > sellerAccountId(2) > itemClass(1), +1 ile 1..8 aralığı.
        const bias =
            1 +
            (dto.externalPlatformId ? 4 : 0) +
            (dto.sellerAccountId ? 2 : 0) +
            (dto.itemClass ? 1 : 0);

        entity.sellerAccountId = dto.sellerAccountId;
        entity.itemClass = dto.itemClass || "";
        entity.externalPlatformId = dto.externalPlatformId;
        entity.percent = dto.percent || 0;
        entity.bias = bias;
        return entity;
    }
}
