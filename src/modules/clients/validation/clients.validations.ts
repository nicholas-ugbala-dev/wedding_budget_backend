import { z } from 'zod';

export const createClientValidator = z.object({
    first_name:    z.string().min(1, "First name is required").max(100),
    last_name:     z.string().min(1, "Last name is required").max(100),
    currency_code: z.string().length(3, "Currency must be 3 letters").toUpperCase(),
});

export const updateClientValidator = z.object({
    first_name:    z.string().min(1).max(100).optional(),
    last_name:     z.string().min(1).max(100).optional(),
    currency_code: z.string().length(3).toUpperCase().optional(),
});

export type CreateClientValidator = z.infer<typeof createClientValidator>;
export type UpdateClientValidator = z.infer<typeof updateClientValidator>;
