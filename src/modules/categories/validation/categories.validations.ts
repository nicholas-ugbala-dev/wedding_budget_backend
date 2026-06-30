import { z } from 'zod';

export const createCategoryValidator = z.object({
    name: z.string().min(1, "Category name is required").max(100),
    ceremony: z.string().min(1, "Ceremony is required").max(100),
});

export const updateCategoryValidator = z.object({
    name: z.string().min(1, "Category name is required").max(100).optional(),
    ceremony: z.string().min(1, "Ceremony is required").max(100).optional(),
});

export const listCategoriesValidator = z.object({
    ceremony: z.string().optional(),
});

export type CreateCategoryValidator = z.infer<typeof createCategoryValidator>;
export type UpdateCategoryValidator = z.infer<typeof updateCategoryValidator>;
export type ListCategoriesValidator = z.infer<typeof listCategoriesValidator>;
