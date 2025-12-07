import {
    Controller,
    Get,
    Post,
    Put,
    Delete,
    Param,
    Body,
    UseGuards,
    NotFoundException,
    UnauthorizedException,
} from '@nestjs/common';
import { AccountService } from '../service/account.service';
import { AccountDTO, AccountSearchParamsDTO } from '@tk-postral/payment-common';
import {
    CurrentUser,
    EntityOwnershipGroupClientService,
    EntityOwnershipService,
    JwtAuthGuard,
} from '@ubs-platform/users-microservice-helper';
import { UserAuthBackendDTO } from '@ubs-platform/users-common';
import { PostralConstants } from '../util/consts';
import { lastValueFrom } from 'rxjs';
import { BaseCrudControllerGenerator } from '@ubs-platform/crud-base';
import { Account } from '../entity';
import { Optional } from '@ubs-platform/crud-base-common/utils';

@Controller('account')
export class AccountNewController extends BaseCrudControllerGenerator<
    Account,
    String,
    AccountDTO,
    AccountDTO,
    AccountSearchParamsDTO
>({
    authorization: {
        ALL: { needsAuthenticated: true },
    },
}) {
    constructor(
        protected readonly service: AccountService,
        protected readonly eoClient: EntityOwnershipService,
    ) {
        super(service);
    }

    manipulateSearch(
        user: Optional<UserAuthBackendDTO>,
        queriesAndPaths: Optional<AccountSearchParamsDTO>,
    ) {
        // Eğer kullanıcı admin değilse ve admin=true ile arama yapmaya çalışıyorsa hata fırlat
        if (queriesAndPaths == null) {
            queriesAndPaths = {};
        }
        let isUserAdmin = user?.roles?.includes('ADMIN');

        if (!isUserAdmin && (queriesAndPaths?.admin === 'true')) {
            throw new UnauthorizedException(
                'Only admins can search with admin=true',
            );
        }

        // Eğer kullanıcı admin değilse, entityOwnershipGroupId verilmişse, kullanıcının o gruba erişimi olup olmadığını kontrol et
        if (queriesAndPaths?.admin !== 'true') {
            if (queriesAndPaths?.entityOwnershipGroupId != null) {
                const isInEog = lastValueFrom(
                    this.eoClient.hasOwnership(
                        {
                            entityOwnershipGroupId: queriesAndPaths.entityOwnershipGroupId,
                            userId: user?.id!,
                            capabilityAtLeastOne: ["OWNER", "EDITOR", "VIEWER"],
                            entityGroup: PostralConstants.ENTITY_GROUP_POSTRAL,
                            entityName: PostralConstants.ENTITY_NAME_ACCOUNT,
                        }
                    )
                );

                if (!isInEog) {
                    throw new NotFoundException(
                        `EntityOwnershipGroup with id ${queriesAndPaths.entityOwnershipGroupId} not found or you do not have access`,
                    );
                }
            }
        }

        // Eğer kullanıcı admin değilse ve entityOwnershipGroupId verilmemişse, kendi userId'sini ekle
        if (!isUserAdmin && !queriesAndPaths?.entityOwnershipGroupId) {
            queriesAndPaths.ownerUserId = user?.id;
        }

        return queriesAndPaths;
    }
}
