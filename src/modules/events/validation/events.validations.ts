import { z } from 'zod';

const sharedFields = {
    event_type: z.string().max(50).optional(),
    date: z.iso
        .date('Invalid date')
        .optional()
        .or(z.literal(''))
        .transform((v) => v || undefined),
    location: z.string().max(200).optional(),
    vendor_currency: z.string().length(3).toUpperCase().optional(),
    budget: z.number().int().nonnegative().optional(),
    client_id: z.uuid().optional(),
};

export const createEventValidator = z.object({
    name: z.string().min(1, 'Event name is required').max(100),
    ...sharedFields,
});

export const updateEventValidator = z.object({
    name: z.string().min(1).max(100).optional(),
    ...sharedFields,
});

export type CreateEventValidator = z.infer<typeof createEventValidator>;
export type UpdateEventValidator = z.infer<typeof updateEventValidator>;
