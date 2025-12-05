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
} from '@nestjs/common';
import { AccountService } from '../service/account.service';
import { AccountDTO, AccountSearchParamsDTO } from '@tk-postral/payment-common';
import {
    CurrentUser,
    EntityOwnershipService,
    JwtAuthGuard,
} from '@ubs-platform/users-microservice-helper';
import { UserAuthBackendDTO } from '@ubs-platform/users-common';
import { PostralConstants } from '../util/consts';
import { lastValueFrom } from 'rxjs';
import { BaseCrudControllerGenerator } from '@ubs-platform/crud-base';
import { Account } from '../entity';

@Controller('account')
export class AccountNewController extends BaseCrudControllerGenerator<Account, AccountDTO, AccountDTO, AccountSearchParamsDTO>(
    {
        authorization: {
            ALL: {needsAuthenticated: true},
        }
    }) {
    constructor(
        protected readonly service: AccountService,
        protected readonly entityOwnershipService: EntityOwnershipService
    ) {
        super(service);
    }
}