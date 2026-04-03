import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ReportQuery } from '../entity/report-query.entity';
import { ReportQueryDTO, ReportQuerySearchDTO } from '@tk-postral/payment-common';
import { BaseCrudService } from '@ubs-platform/crud-base';
import { UserAuthBackendDTO } from '@ubs-platform/users-common';
import { TypeormRepositoryWrap } from './base/typeorm-repository-wrap';
import { ReportQueryMapper } from '../mapper/report-query.mapper';

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
        const where: any = {};
        if (s?.ownerAccountId) {
            where.ownerAccountId = s.ownerAccountId;
        }
        return where;
    }
}
