import { z } from 'zod';

export const createCategoryValidator = z.object({
    name: z.string().min(1, "Category name is required").max(100),
    event_id: z.string().uuid("Invalid event ID"),
});

export const updateCategoryValidator = z.object({
    name: z.string().min(1, "Category name is required").max(100).optional(),
    event_id: z.string().uuid("Invalid event ID").optional(),
});

export const listCategoriesValidator = z.object({
    event_id: z.string().uuid().optional(),
});

export type CreateCategoryValidator = z.infer<typeof createCategoryValidator>;
export type UpdateCategoryValidator = z.infer<typeof updateCategoryValidator>;
export type ListCategoriesValidator = z.infer<typeof listCategoriesValidator>;
