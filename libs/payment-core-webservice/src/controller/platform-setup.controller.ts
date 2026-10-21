import { Body, Controller, Get, Post, UseGuards } from '@nestjs/common';
import { CurrentUser, JwtAuthGuard } from '@ubs-platform/users-microservice-helper';
import { Roles, RolesGuard } from '@ubs-platform/users-roles';
import { UserAuthBackendDTO } from '@ubs-platform/users-common';
import { PlatformSetupAccountDTO, PlatformSetupSettingsDTO, PlatformSetupTeamDTO } from '@tk-postral/payment-common';
import { PlatformSetupService } from '../service/platform-setup.service';

@Controller('platform-setup')
@UseGuards(JwtAuthGuard, RolesGuard)
export class PlatformSetupController {
    constructor(private readonly service: PlatformSetupService) {}

    @Get()
    @Roles(['ADMIN', 'POSTRAL-ADMIN', 'POSTRAL_ADMIN'])
    status() { return this.service.status(); }

    @Post('team')
    @Roles(['ADMIN', 'POSTRAL-ADMIN', 'POSTRAL_ADMIN'])
    team(@Body() input: PlatformSetupTeamDTO, @CurrentUser() user: UserAuthBackendDTO) {
        return this.service.team(input?.name, user);
    }

    @Post('platform-account')
    @Roles(['ADMIN', 'POSTRAL-ADMIN', 'POSTRAL_ADMIN'])
    platform(@Body() input: PlatformSetupAccountDTO, @CurrentUser() user: UserAuthBackendDTO) {
        return this.service.saveAccount(input, false, user);
    }

    @Post('settings')
    @Roles(['ADMIN', 'POSTRAL-ADMIN', 'POSTRAL_ADMIN'])
    settings(@Body() input: PlatformSetupSettingsDTO, @CurrentUser() user: UserAuthBackendDTO) {
        return this.service.configure(input, user);
    }

    @Post('seller-account')
    @Roles(['ADMIN', 'POSTRAL-ADMIN', 'POSTRAL_ADMIN'])
    seller(@Body() input: PlatformSetupAccountDTO, @CurrentUser() user: UserAuthBackendDTO) {
        return this.service.saveAccount(input, true, user);
    }

    @Post('complete')
    @Roles(['ADMIN', 'POSTRAL-ADMIN', 'POSTRAL_ADMIN'])
    complete(@CurrentUser() user: UserAuthBackendDTO) { return this.service.complete(user); }

    @Post('keep-existing')
    @Roles(['ADMIN', 'POSTRAL-ADMIN', 'POSTRAL_ADMIN'])
    keepExisting(@CurrentUser() user: UserAuthBackendDTO) { return this.service.keepExisting(user); }
}
