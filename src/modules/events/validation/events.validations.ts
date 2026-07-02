import { z } from 'zod';

export const createEventValidator = z.object({
    name: z.string().min(1, "Event name is required").max(100),
});

export const updateEventValidator = z.object({
    name: z.string().min(1, "Event name is required").max(100),
});

export type CreateEventValidator = z.infer<typeof createEventValidator>;
export type UpdateEventValidator = z.infer<typeof updateEventValidator>;
