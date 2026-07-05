import { z } from 'zod';

const PAYMENT_TYPE_VALUES = ['deposit', 'balance', 'full_payment'] as const;

export const createPaymentValidator = z.object({
    payment_type:         z.enum(PAYMENT_TYPE_VALUES),
    user_currency_id:     z.uuid().optional(),
    wallet_currency_code: z.string().length(3).optional(),
    wallet_amount:        z.number().int().positive(),
    exchange_rate:        z.number().positive().optional(),
    base_amount:          z.number().int().positive().optional(),
    payment_date:         z.string().min(1),
    notes:                z.string().optional(),
}).refine(
    d => d.user_currency_id || d.wallet_currency_code,
    { message: 'Either user_currency_id or wallet_currency_code is required' },
);

export const listPaymentsValidator = z.object({
    event_id:   z.uuid().optional(),
    client_id:  z.uuid().optional(),
    expense_id: z.uuid().optional(),
    page:       z.coerce.number().int().min(1).default(1),
    limit:      z.coerce.number().int().min(1).max(100).default(10),
});

export const paymentsSummaryValidator = z.object({
    event_id:  z.uuid().optional(),
    client_id: z.uuid().optional(),
});

export const updatePaymentValidator = z.object({
    payment_type:         z.enum(PAYMENT_TYPE_VALUES).optional(),
    user_currency_id:     z.uuid().optional(),
    wallet_currency_code: z.string().length(3).optional(),
    wallet_amount:        z.number().int().positive().optional(),
    exchange_rate:        z.number().positive().nullable().optional(),
    base_amount:          z.number().int().positive().optional(),
    payment_date:         z.string().min(1).optional(),
    notes:                z.string().nullable().optional(),
});

export type CreatePaymentValidator = z.infer<typeof createPaymentValidator>;
export type UpdatePaymentValidator = z.infer<typeof updatePaymentValidator>;
export type ListPaymentsValidator = z.infer<typeof listPaymentsValidator>;
export type PaymentsSummaryValidator = z.infer<typeof paymentsSummaryValidator>;
