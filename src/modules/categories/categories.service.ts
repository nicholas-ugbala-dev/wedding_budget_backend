import { ApiError } from '../../utils/error';
import { Category } from '../../config/database/models';
import { ICategoriesService, ICategoriesRepository } from './interface/categories.interface';
import { CreateCategoryValidator, UpdateCategoryValidator } from './validation/categories.validations';
import categoriesRepository from './repository/categories.repository';

export class CategoriesService implements ICategoriesService {
    constructor(private readonly repository: ICategoriesRepository) {}

    async list(userId: string, ceremony?: string): Promise<Category[]> {
        return this.repository.findAll(userId, ceremony);
    }

    async create(userId: string, data: CreateCategoryValidator): Promise<Category> {
        return this.repository.create(userId, data);
    }

    async findOrCreate(userId: string, data: CreateCategoryValidator): Promise<Category> {
        return this.repository.findOrCreate(userId, data);
    }

    async update(id: string, userId: string, data: UpdateCategoryValidator): Promise<Category> {
        const existing = await this.repository.findById(id, userId);
        if (!existing) {
            throw new ApiError(404, 'Category not found');
        }
        return this.repository.update(id, userId, data);
    }

    async delete(id: string, userId: string): Promise<void> {
        const existing = await this.repository.findById(id, userId);
        if (!existing) {
            throw new ApiError(404, 'Category not found');
        }
        await this.repository.delete(id, userId);
    }
}

const categoriesService = new CategoriesService(categoriesRepository);
export default categoriesService;
