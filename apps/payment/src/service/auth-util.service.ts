import { Injectable } from '@nestjs/common';
import { EntityOwnershipService } from '@ubs-platform/users-microservice-helper';
import { PostralConstants } from '../util/consts';
import { lastValueFrom } from 'rxjs';

@Injectable()
export class AuthUtilService {
    /**
     *
     */
    constructor(private eo: EntityOwnershipService) {}

    async fetchUserAccountIds(userId: string, capabilityAtLeastOne: string[]) {
        return await lastValueFrom(
            this.eo.searchOwnershipEntityIdsByUser({
                entityGroup: PostralConstants.ENTITY_GROUP_POSTRAL,
                entityName: PostralConstants.ENTITY_NAME_ACCOUNT,
                userId,
                capabilityAtLeastOne,
            }),
        );
    }

    async searchOwnedIds(
        entityName: string,
        capabilityAtLeastOne: string[],
        {
            userId,
            ownershipGroupId,
        }: { userId?: string; ownershipGroupId?: string },
    ) {
        if (!userId && !ownershipGroupId) {
            throw new Error('userId veya ownershipGroupId sağlanmalıdır');
        }
        if (capabilityAtLeastOne.length === 0) {
            throw new Error('En az bir yetenek sağlanmalıdır');
        }

        return await lastValueFrom(
            this.eo.searchOwnershipEntityIdsByUser({
                entityGroup: PostralConstants.ENTITY_GROUP_POSTRAL,
                entityName,
                userId,
                entityOwnershipGroupId: ownershipGroupId,
                capabilityAtLeastOne,
            }),
        );
    }
}
