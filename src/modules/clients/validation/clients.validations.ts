import { z } from 'zod';

const currencyCode = z.string().length(3).toUpperCase();

export const listClientsValidator = z.object({
    search: z.string().optional(),
    page: z.coerce.number().int().min(1).default(1),
    limit: z.coerce.number().int().min(1).max(100).default(10),
});

export const createClientValidator = z.object({
    first_name: z.string().min(1, 'First name is required').max(100),
    last_name: z.string().min(1, 'Last name is required').max(100),
    currency_code: currencyCode,
    extra_currencies: z.array(currencyCode).optional(),
});

export const updateClientValidator = z.object({
    first_name: z.string().min(1).max(100).optional(),
    last_name: z.string().min(1).max(100).optional(),
    currency_code: currencyCode.optional(),
    extra_currencies: z.array(currencyCode).optional(),
});

export type CreateClientValidator = z.infer<typeof createClientValidator>;
export type UpdateClientValidator = z.infer<typeof updateClientValidator>;
export type ListClientsValidator = z.infer<typeof listClientsValidator>;
