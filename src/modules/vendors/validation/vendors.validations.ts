import { z } from 'zod';

export const createVendorValidator = z.object({
    name: z.string().min(1, "Vendor name is required").max(100),
    phone: z.string().max(50).optional(),
    email: z.email("Invalid email address").optional(),
    website: z.string().max(100).optional(),
});

export const updateVendorValidator = z.object({
    name: z.string().min(1, "Vendor name is required").max(100).optional(),
    phone: z.string().max(50).optional().nullable(),
    email: z.email("Invalid email address").optional().nullable(),
    website: z.string().max(100).optional().nullable(),
});

export const listVendorsValidator = z.object({
    search: z.string().optional(),
});

export type CreateVendorValidator = z.infer<typeof createVendorValidator>;
export type UpdateVendorValidator = z.infer<typeof updateVendorValidator>;
export type ListVendorsValidator = z.infer<typeof listVendorsValidator>;
