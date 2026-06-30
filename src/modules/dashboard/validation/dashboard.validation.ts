import { z } from 'zod';

export const getDashboardValidator = z.object({
    ceremony_id: z.uuid().optional(),
});

export type GetDashboardValidator = z.infer<typeof getDashboardValidator>;
