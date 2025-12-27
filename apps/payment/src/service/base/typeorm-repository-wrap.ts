import { IRepositoryWrap } from '@ubs-platform/crud-base';
import { ObjectLiteral, Repository } from 'typeorm';
import { TypeormSearchUtil } from './typeorm-search-util';

export class TypeormRepositoryWrap<MODEL extends ObjectLiteral, ID>
    implements IRepositoryWrap<MODEL, ID, Repository<MODEL>>
{
    constructor(private repository: Repository<MODEL>, private relations: string[]) {}

    async findById(id: ID): Promise<MODEL | null> {
        return this.repository.findOneBy({ id } as any);
    }
    async saveModel(m: MODEL): Promise<MODEL> {
        return this.repository.save(m);
    }
    async deleteById(id: ID): Promise<void> {
        await this.repository.delete(id as any);
    }
    async search(params: any): Promise<MODEL[]> {
        return this.repository.find({ where: params, relations: this.relations });
    }
    async findAll(): Promise<MODEL[]> {
        return this.repository.find({ relations: this.relations });
    }
    async find(params: any): Promise<MODEL[]> {
        return this.repository.find({ where: params, relations: this.relations });
    }
    async findOne(params: any): Promise<MODEL | null> {
        return this.repository.findOne({ where: params, relations: this.relations });
    }
    async modelSearch(
        size: number | string,
        page: number | string,
        sort: { [key: string]: 1 | -1 | 'asc' | 'desc' },
        ...searchParamsQuery: any[]
    ) {
        return TypeormSearchUtil.modelSearch<MODEL>(
            this.repository,
            size,
            page,
            sort,
            this.relations,
            ...searchParamsQuery,
        );
    }
    rawRepository(): Repository<MODEL> {
        return this.repository;
    }


}
