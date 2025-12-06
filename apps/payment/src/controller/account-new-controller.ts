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
        protected readonly eogClient: EntityOwnershipGroupClientService,
    ) {
        super(service);
    }

    manipulateSearch(
        user: Optional<UserAuthBackendDTO>,
        queriesAndPaths: Optional<AccountSearchParamsDTO>,
    ) {
        let isAdmin = user?.roles?.includes('ADMIN');
        if (queriesAndPaths == null) {
            queriesAndPaths = {};
        }

        if (queriesAndPaths?.admin === 'true') {
            if (!isAdmin) {
                throw new UnauthorizedException(
                    'Only admins can search with admin=true',
                );
            }
            return queriesAndPaths;
        }

        if (queriesAndPaths?.ownerUserId == null) {
            queriesAndPaths.ownerUserId = user?.id;
        }
        if (!isAdmin && queriesAndPaths.ownerUserId !== user?.id) {
            throw new UnauthorizedException(
                'You can only search accounts for yourself',
            );
        }
        return queriesAndPaths;
    }
}
