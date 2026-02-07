import { RawSearchResult } from '@ubs-platform/crud-base-common';
import { ObjectLiteral, Repository } from 'typeorm';

export class TypeormSearchUtil {
    /**
     *
     * @param model
     * @param size
     * @param page first page is zero
     * @param searchParamsQuery
     * @returns
     */
    static async modelSearch<OUTPUT extends ObjectLiteral>(
        model: Repository<OUTPUT>,
        size: number | string,
        page: number | string,
        sort: { [key: string]: 1 | -1 | 'asc' | 'desc' },
        relations: string[],
        // sortByFieldName: string | null | undefined,
        // sortByType: 'desc' | 'asc' | '' | null | undefined,
        ...searchParamsQuery: any[]
    ) {
        if (searchParamsQuery.length == 1 && searchParamsQuery[0]["$match"]) {
            searchParamsQuery = searchParamsQuery[0]["$match"];
        }
        //@ts-ignore
        size = parseInt(size) || 10;
        //@ts-ignore
        page = parseInt(page) || 0;

        const count = await model.count({
            where: searchParamsQuery,
            relations: relations,
        });

        // const content = model.createQueryBuilder().where(whereCondition);
        let order = {}
        if (sort) {
            for (const key in sort) {
                order[key] = sort[key] === 1 || sort[key] === 'asc' ? 'ASC' : 'DESC'
            }
        }
        const content = await model.find({
            where: searchParamsQuery,
            relations: relations,
            skip: page * size,
            take: size,
            order: order,
        });
        // if (sort) {
        //     for (const key in sort) {
        //         query = query.addOrderBy(key, sort[key] === 1 || sort[key] === 'asc' ? 'ASC' : 'DESC');
        //     }
        // }

        // const content = await query.skip(page * size).take(size).getMany();
        const result = new RawSearchResult<OUTPUT>(
            content,
            page,
            size,
            count,
            Math.ceil(count / size) - 1,
            (page + 1) * size >= count,
            page === 0,
        );
        return Promise.resolve(result);
        // return {
        //     content,
        //     totalCount: count,
        //     page: page,
        //     size: size,
        //     maxItemLength: count,
        //     maxPagesIndex: Math.ceil(count / size) - 1,
        //     lastPage: (page + 1) * size >= count,
        //     firstPage: page === 0,

        // } as RawSearchResult<OUTPUT>;
    }
}
