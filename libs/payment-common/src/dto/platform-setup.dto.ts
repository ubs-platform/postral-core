import { AccountDTO } from './account.dto';
import { AccountAddressDto } from './address.dto';
import { SellerReportSetupGrouping } from './seller-report-setup.dto';

export type PlatformSetupMode = 'SELF' | 'MARKETPLACE';
export type PlatformSetupStep = 'TEAM' | 'PLATFORM' | 'SETTINGS' | 'SELLER' | 'REVIEW' | 'COMPLETED';

export class PlatformSetupTeamDTO {
    name!: string;
}

export class PlatformSetupAccountDTO {
    account!: AccountDTO;
    address?: AccountAddressDto;
    usePlatformAddress?: boolean;
}

export class PlatformSetupSettingsDTO {
    mode!: PlatformSetupMode;
    currency!: string;
    commissionPercent!: number;
    taxRate!: number;
    billingDays!: number[];
    alsoSells!: boolean;
    sellerReports!: boolean;
    dateGroupings!: SellerReportSetupGrouping[];
}

export class PlatformSetupStatusDTO {
    status!: 'NOT_STARTED' | 'IN_PROGRESS' | 'COMPLETED';
    step!: PlatformSetupStep;
    version!: number;
    startedByUserId?: string;
    teamId?: string;
    teamName?: string;
    platformAccountId?: string;
    platformAccountName?: string;
    sellerAccountId?: string;
    sellerAccountName?: string;
    settings?: PlatformSetupSettingsDTO;
    legacyAvailable!: boolean;
    completedAt?: Date | string;
}
