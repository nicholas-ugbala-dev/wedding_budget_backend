import { dbQuery } from '../../../config/database/helper/query.helpers';
import { Category } from '../../../config/database/models';
import { ICategoriesRepository } from '../interface/categories.interface';
import { CreateCategoryValidator, UpdateCategoryValidator } from '../validation/categories.validations';
import CategoriesQueries from '../query/categories.queries';

const { findAll, findById, findByNameAndCeremony, create, update, remove } = CategoriesQueries;

export class CategoriesRepository implements ICategoriesRepository {
    async findAll(userId: string, ceremonyId?: string): Promise<Category[]> {
        return (await dbQuery.manyOrNone<Category>(findAll, [userId, ceremonyId ?? null])) ?? [];
    }

    async findById(id: string, userId: string): Promise<Category | null> {
        return dbQuery.oneOrNone<Category>(findById, [id, userId]);
    }

    async findByNameAndCeremony(userId: string, name: string, ceremonyId: string): Promise<Category | null> {
        return dbQuery.oneOrNone<Category>(findByNameAndCeremony, [userId, name, ceremonyId]);
    }

    async create(userId: string, data: CreateCategoryValidator): Promise<Category> {
        return dbQuery.one<Category>(create, [userId, data.ceremony_id, data.name]);
    }

    async findOrCreate(userId: string, data: CreateCategoryValidator): Promise<Category> {
        const existing = await this.findByNameAndCeremony(userId, data.name, data.ceremony_id);
        if (existing) return existing;
        return this.create(userId, data);
    }

    async update(id: string, userId: string, data: UpdateCategoryValidator): Promise<Category> {
        return dbQuery.one<Category>(update, [
            data.name ?? null,
            data.ceremony_id ?? null,
            id,
            userId,
        ]);
    }

    async delete(id: string, userId: string): Promise<void> {
        await dbQuery.manyOrNone(remove, [id, userId]);
    }
}

const categoriesRepository = new CategoriesRepository();
export default categoriesRepository;
