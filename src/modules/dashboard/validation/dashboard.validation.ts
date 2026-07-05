import { z } from 'zod';

export const getDashboardValidator = z.object({
    event_id: z.uuid().optional(),
    client_id: z.uuid().optional(),
});

export type GetDashboardValidator = z.infer<typeof getDashboardValidator>;
