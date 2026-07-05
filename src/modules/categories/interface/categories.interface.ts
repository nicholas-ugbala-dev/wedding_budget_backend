import { Category } from '../../../config/database/models';
import { CreateCategoryValidator, UpdateCategoryValidator } from '../validation/categories.validations';

export interface ICategoriesRepository {
    findAll(userId: string): Promise<Category[]>;
    findById(id: string, userId: string): Promise<Category | null>;
    findByName(userId: string, name: string): Promise<Category | null>;
    create(userId: string, data: CreateCategoryValidator): Promise<Category>;
    findOrCreate(userId: string, name: string): Promise<Category>;
    update(id: string, userId: string, data: UpdateCategoryValidator): Promise<Category>;
    delete(id: string, userId: string): Promise<void>;
}

export interface ICategoriesService {
    list(userId: string): Promise<Category[]>;
    create(userId: string, data: CreateCategoryValidator): Promise<Category>;
    findOrCreate(userId: string, name: string): Promise<Category>;
    update(id: string, userId: string, data: UpdateCategoryValidator): Promise<Category>;
    delete(id: string, userId: string): Promise<void>;
}
