import { z } from 'zod';

export const addCurrencyValidator = z.object({
    currency_code: z.string().length(3, "Currency must be a 3-letter code").toUpperCase(),
});

export type AddCurrencyValidator = z.infer<typeof addCurrencyValidator>;
