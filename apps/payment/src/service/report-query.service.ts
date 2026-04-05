import { Injectable, UnauthorizedException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { In, Repository } from 'typeorm';
import { ReportQuery } from '../entity/report-query.entity';
import { ReportQueryDTO, ReportQuerySearchDTO } from '@tk-postral/payment-common';
import { BaseCrudService } from '@ubs-platform/crud-base';
import { UserAuthBackendDTO } from '@ubs-platform/users-common';
import { TypeormRepositoryWrap } from './base/typeorm-repository-wrap';
import { ReportQueryMapper } from '../mapper/report-query.mapper';
import { AuthUtilService } from './auth-util.service';

@Injectable()
export class ReportQueryCrudService extends BaseCrudService<
    ReportQuery,
    string,
    ReportQueryDTO,
    ReportQueryDTO,
    ReportQuerySearchDTO
> {
    constructor(
        @InjectRepository(ReportQuery)
        public repo: Repository<ReportQuery>,
        private readonly reportQueryMapper: ReportQueryMapper,
        private readonly authUtil: AuthUtilService
    ) {
        super(new TypeormRepositoryWrap<ReportQuery, string>(repo));
    }

    getIdFieldNameFromInput(i: ReportQueryDTO): string {
        return i.id!;
    }

    getIdFieldNameFromModel(i: ReportQuery): string {
        return i.id;
    }

    generateNewModel(): ReportQuery {
        return new ReportQuery();
    }

    toOutput(m: ReportQuery): ReportQueryDTO {
        return this.reportQueryMapper.toDto(m);
    }

    moveIntoModel(model: ReportQuery, i: ReportQueryDTO): ReportQuery {
        return this.reportQueryMapper.updateEntity(model, i);
    }

    async searchParams(s?: Partial<ReportQuerySearchDTO>, _u?: UserAuthBackendDTO): Promise<any> {
        if (!(_u && (_u?.roles.includes('admin') || _u?.roles.includes('postral-admin'))) && s?.admin === "true") {
            throw new UnauthorizedException('Only admins can search with admin=true');
        }
        const where: any = {}
        if (_u && s?.admin !== "true") {
            const accountIds = await this.authUtil.fetchUserAccountIds(_u?.id);
            where.ownerAccountId = accountIds.length > 0 ? In(accountIds) : null; // if user has no accounts, set to null to return empty result
        }
        return where;
    }
}
