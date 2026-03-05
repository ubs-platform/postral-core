import { Injectable, UnauthorizedException } from '@nestjs/common';
import { EntityOwnershipService } from '@ubs-platform/users-microservice-helper';
import { PostralConstants } from '../util/consts';
import { lastValueFrom } from 'rxjs';
import { UserAuthBackendDTO } from '@ubs-platform/users-common';
import { Optional } from '@ubs-platform/crud-base-common/utils';
import { exec } from 'child_process';

@Injectable()
export class AuthUtilService {
    /**
     *
     */
    constructor(private eo: EntityOwnershipService) {}

    public async resolveIdByOperation(
        operation: 'ADD' | 'EDIT' | 'REMOVE' | 'GETALL' | 'GETID',
        queriesAndPaths?: Optional<{ [key: string]: any }>,
        body?: Optional<{ id?: string }>,
    ): Promise<string> {
        if (operation === 'ADD' || operation === 'EDIT') {
            return body?.id || '';
        }
        if (operation === 'REMOVE' || operation === 'GETID') {
            return queriesAndPaths?.id || '';
        }
        return '';
    }

    private resolveCapabilities(
        operation: 'ADD' | 'EDIT' | 'REMOVE' | 'GETALL' | 'GETID',
    ): string[] {
        if (operation === 'GETALL' || operation === 'GETID') {
            return ['OWNER', 'EDITOR', 'VIEWER'];
        }
        return ['OWNER', 'EDITOR'];
    }

    async checkUserEntityOwnership(
        operation: 'ADD' | 'EDIT' | 'REMOVE' | 'GETALL' | 'GETID',
        user: Optional<UserAuthBackendDTO>,
        queriesAndPaths: Optional<{ [key: string]: any }>,
        body: Optional<{ id?: string }>,
        entityName: string,
        unauthorizedMessageEntityName: string,
    ): Promise<void> {
        const id = await this.resolveIdByOperation(operation, queriesAndPaths, body);

        if (!id || !user) {
            return Promise.resolve();
        }

        const capabilityAtLeastOne = this.resolveCapabilities(operation);

        const hasOwnership = await lastValueFrom(
            this.eo.hasOwnership({
                entityGroup: PostralConstants.ENTITY_GROUP_POSTRAL,
                entityName,
                ...((typeof id === 'string' && id) || id != null
                    ? { entityId: id }
                    : {}),
                ...(!id &&
                typeof queriesAndPaths?.entityOwnershipGroupId === 'string' &&
                queriesAndPaths?.entityOwnershipGroupId
                    ? {
                          entityOwnershipGroupId:
                              queriesAndPaths.entityOwnershipGroupId,
                      }
                    : {}),
                userId: user.id,
                capabilityAtLeastOne,
            }),
        );

        if (!hasOwnership) {
            throw new UnauthorizedException(
                `User does not have ownership for ${unauthorizedMessageEntityName} ${id}`,
            );
        }
    }

    manipulateSearchOwnership<
        T extends {
            admin?: string;
            entityOwnershipGroupId?: string;
            ownerUserId?: string;
            deactivated?: string;
        },
    >(
        user: Optional<UserAuthBackendDTO>,
        queriesAndPaths: Optional<T>,
    ): T {
        const manipulatedQueries = (queriesAndPaths || {}) as T;
        const isUserAdmin = user?.roles?.includes('ADMIN');
        const isAdminSearchMode = manipulatedQueries?.admin === 'true';

        if (!isUserAdmin && isAdminSearchMode) {
            throw new UnauthorizedException(
                'Only admins can search with admin=true',
            );
        }

        if (
            !isAdminSearchMode &&
            !manipulatedQueries?.entityOwnershipGroupId
        ) {
            manipulatedQueries.ownerUserId = user?.id;
        }

        return manipulatedQueries;
    }

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

    async afterCreate(
        entityGroup: string,
        entityName: string,
        entityId: string,
        userId?: string,
        entityOwnershipGroupId?: string,
    ): Promise<void> {
        if (!userId) {
            return Promise.resolve();
        }
        await this.eo.insertOwnership({
            entityGroup,
            entityName,
            entityId,
            overriderRoles: ['ADMIN'],
            ...(!entityOwnershipGroupId
                ? {
                      userCapabilities: [{ userId, capability: 'OWNER' }],
                  }
                : { userCapabilities: [] }),
            ...(entityOwnershipGroupId
                ? { entityOwnershipGroupId }
                : { entityOwnershipGroupId: '' }),
        });
    }
}
