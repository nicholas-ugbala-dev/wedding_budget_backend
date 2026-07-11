import type { PoolClient } from 'pg';
import { dbQuery } from '../../../config/database/helper/query.helpers';
import { Category } from '../../../config/database/models';
import { ICategoriesRepository } from '../interface/categories.interface';
import { CreateCategoryValidator, UpdateCategoryValidator } from '../validation/categories.validations';
import CategoriesQueries from '../query/categories.queries';

const { findAll, findById, findByName, create, update, remove } = CategoriesQueries;

export class CategoriesRepository implements ICategoriesRepository {
    async findAll(userId: string): Promise<Category[]> {
        return (await dbQuery.manyOrNone<Category>(findAll, [userId])) ?? [];
    }

    async findById(id: string, userId: string): Promise<Category | null> {
        return dbQuery.oneOrNone<Category>(findById, [id, userId]);
    }

    async findByName(userId: string, name: string, client?: PoolClient): Promise<Category | null> {
        return dbQuery.oneOrNone<Category>(findByName, [userId, name], client);
    }

    async create(userId: string, data: CreateCategoryValidator, client?: PoolClient): Promise<Category> {
        return dbQuery.one<Category>(create, [userId, data.name], client);
    }

    async findOrCreate(userId: string, name: string, client?: PoolClient): Promise<Category> {
        const existing = await this.findByName(userId, name, client);
        if (existing) return existing;
        return this.create(userId, { name }, client);
    }

    async update(id: string, userId: string, data: UpdateCategoryValidator): Promise<Category> {
        return dbQuery.one<Category>(update, [data.name ?? null, id, userId]);
    }

    async delete(id: string, userId: string): Promise<void> {
        await dbQuery.manyOrNone(remove, [id, userId]);
    }
}

const categoriesRepository = new CategoriesRepository();
export default categoriesRepository;
