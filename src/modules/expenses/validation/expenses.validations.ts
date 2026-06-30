import { z } from 'zod';

export const createExpenseValidator = z.object({
    name: z.string().min(1, "Expense name is required").max(100),
    ceremony_id: z.string().uuid("Invalid ceremony ID"),
    // Category: pass existing id OR name (service will findOrCreate by name+ceremony_id)
    category_id: z.string().uuid("Invalid category ID").optional(),
    category_name: z.string().min(1).max(100).optional(),
    // Vendor: all optional inline creation fields
    vendor_id: z.string().uuid("Invalid vendor ID").optional(),
    vendor_name: z.string().max(100).optional(),
    vendor_phone: z.string().max(50).optional(),
    vendor_email: z.email("Invalid vendor email").optional(),
    // Amounts
    planned_amount: z.number().int().nonnegative().optional(),
    actual_amount: z.number().int().nonnegative().optional(),
    base_currency: z.string().length(3).toUpperCase().optional(),
    refundable_amount: z.number().int().nonnegative().optional(),
    is_planned: z.boolean().optional().default(false),
    payment_deadline: z.string().date().optional(),
    notes: z.string().optional(),
}).refine(
    (d) => d.category_id || d.category_name,
    { message: "Either category_id or category_name is required" }
);

export const updateExpenseValidator = z.object({
    name: z.string().min(1).max(100).optional(),
    ceremony_id: z.string().uuid("Invalid ceremony ID").optional(),
    category_id: z.string().uuid().optional(),
    vendor_id: z.string().uuid().nullable().optional(),
    planned_amount: z.number().int().nonnegative().nullable().optional(),
    actual_amount: z.number().int().nonnegative().nullable().optional(),
    refundable_amount: z.number().int().nonnegative().optional(),
    is_refunded: z.boolean().optional(),
    is_planned: z.boolean().optional(),
    payment_deadline: z.string().date().nullable().optional(),
    notes: z.string().nullable().optional(),
});

export const listExpensesValidator = z.object({
    ceremony_id: z.string().uuid().optional(),
    status: z.enum(['unpaid', 'partial', 'paid']).optional(),
    search: z.string().optional(),
    page: z.coerce.number().int().min(1).default(1),
    limit: z.coerce.number().int().min(1).max(100).default(10),
});

export type CreateExpenseValidator = z.infer<typeof createExpenseValidator>;
export type UpdateExpenseValidator = z.infer<typeof updateExpenseValidator>;
export type ListExpensesValidator = z.infer<typeof listExpensesValidator>;
