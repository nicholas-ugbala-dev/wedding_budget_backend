import { z } from 'zod';

export const createCeremonyValidator = z.object({
    name: z.string().min(1, "Ceremony name is required").max(100),
});

export const updateCeremonyValidator = z.object({
    name: z.string().min(1, "Ceremony name is required").max(100),
});

export type CreateCeremonyValidator = z.infer<typeof createCeremonyValidator>;
export type UpdateCeremonyValidator = z.infer<typeof updateCeremonyValidator>;
