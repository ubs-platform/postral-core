import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { SearchRequest, SearchResult } from '@ubs-platform/crud-base-common';
import { FilterQuery, HydratedDocument, Model, ObjectId } from 'mongoose';
import { UserAuthBackendDTO } from '@ubs-platform/users-common';
import { BaseCrudKlass, SearchUtil } from '@ubs-platform/crud-base';
import { ObjectLiteral, Repository } from 'typeorm';
import { TypeormSearchUtil } from './typeorm-search-util';

export abstract class TypeormBaseCrudService<
    MODEL extends ObjectLiteral,
    INPUT extends { id?: any },
    OUTPUT,
    SEARCH,
> extends BaseCrudKlass {
    constructor(public m: Repository<MODEL>) {
        super();
    }

    abstract generateNewModel(): MODEL;
    abstract toOutput(m: MODEL): Promise<OUTPUT> | OUTPUT;
    abstract moveIntoModel(model: MODEL, i: INPUT): Promise<MODEL> | MODEL;
    abstract searchParams(s?: Partial<SEARCH>): Promise<any> | any;

    async convertAndReturnTheList(list: MODEL[], user?: UserAuthBackendDTO) {
        const outputList: OUTPUT[] = [];
        for (let index = 0; index < list.length; index++) {
            const item = list[index];
            outputList.push(await this.toOutput(item));
        }
        return outputList;
    }

    async searchPagination(
        searchAndPagination?: SEARCH & SearchRequest,
        user?: UserAuthBackendDTO,
    ): Promise<SearchResult<OUTPUT>> {
        const page = searchAndPagination?.page || 0,
            size = searchAndPagination?.size || 10;

        let s = await this.searchParams(searchAndPagination); //{ ...searchAndPagination, page: undefined, size: undefined };
        let sort;
        if (searchAndPagination?.sortBy && searchAndPagination.sortRotation) {
            sort = {};
            sort[searchAndPagination.sortBy] = searchAndPagination.sortRotation;
        }
        return (
            await TypeormSearchUtil.modelSearch(this.m, size, page, sort, {
                $match: s,
            })
        ).mapAsync((a) => this.toOutput(a));
    }

    async fetchAll(
        s?: Partial<SEARCH>,
        user?: UserAuthBackendDTO,
    ): Promise<OUTPUT[]> {
        const list = await this.m.find({ where: await this.searchParams(s) });
        return await this.convertAndReturnTheList(list, user);
    }

    async fetchOne(id: any, user?: UserAuthBackendDTO): Promise<OUTPUT> {
        return this.toOutput((await this.m.findOneBy({ id })) as MODEL);
    }

    async create(input: INPUT, user?: UserAuthBackendDTO): Promise<OUTPUT> {
        let newModel = this.generateNewModel();
        await this.moveIntoModel(newModel, input);
        await this.beforeCreateOrEdit(newModel, 'CREATE', user);

        await this.m.save(newModel);
        const out = await this.toOutput(newModel);
        await this.afterCreate(out, user);
        return out;
    }

    async edit(input: INPUT, user?: UserAuthBackendDTO): Promise<OUTPUT> {
        const newModelFirst = await this.m.findOneBy({ id: input.id });

        const newModel = await this.moveIntoModel(
            newModelFirst as MODEL,
            input,
        );

        await this.beforeCreateOrEdit(newModel, 'EDIT', user);

        await this.m.save(newModel);

        return this.toOutput(newModel as MODEL);
    }

    async remove(
        id: any,
        user?: UserAuthBackendDTO,
    ): Promise<OUTPUT> {
        let ac = await this.m.findOneBy({ id });
        await this.m.remove(ac as MODEL);
        return this.toOutput(ac as MODEL);
    }

    async afterCreate(m: OUTPUT, user?: UserAuthBackendDTO) {}

    async beforeCreateOrEdit(
        i: MODEL,
        mode: 'EDIT' | 'CREATE',
        user?: UserAuthBackendDTO,
    ) {}
}

// return BaseCrudService;
