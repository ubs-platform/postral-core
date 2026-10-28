import { BadRequestException } from '@nestjs/common';
import { ItemSearchDTO } from '@tk-postral/payment-common';

export function itemDetailFilters(search: Pick<ItemSearchDTO,
    'isPhysical' | 'metaEntityGroup' | 'metaEntityName' | 'metaEntityId'
> = {}) {
    const { isPhysical, metaEntityGroup, metaEntityName, metaEntityId } = search;
    if (isPhysical !== undefined && isPhysical !== 'true' && isPhysical !== 'false') {
        throw new BadRequestException('isPhysical filter must be true or false');
    }
    return {
        ...(isPhysical !== undefined ? { isPhysical: isPhysical === 'true' } : {}),
        ...(metaEntityGroup ? { metaEntityGroup } : {}),
        ...(metaEntityName ? { metaEntityName } : {}),
        ...(metaEntityId ? { metaEntityId } : {}),
    };
}
