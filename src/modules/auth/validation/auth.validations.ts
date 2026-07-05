import { z } from 'zod';

export const registerValidator = z.object({
    first_name: z.string().min(1, "First Name is required"),
    last_name: z.string().min(1, "Last Name is required"),
    email: z.email("Invalid email address"),
    password: z.string().min(8, "Password must be at least 8 characters"),
    account_type: z.enum(['couple', 'planner']).default('couple'),
});

export const loginValidator = z.object({
    email: z.email("Invalid email address"),
    password: z.string().min(1, "Password is required"),
});

export const onboardingValidator = z.object({
    base_currency: z.string().length(3, "Currency must be a 3-letter code").toUpperCase(),
});

export const onboardingEventsValidator = z.object({
    events: z.array(z.string().min(1)).min(1, "At least one event is required"),
});

export const onboardingCurrenciesValidator = z.object({
    currencies: z.array(z.string().length(3, "Currency must be a 3-letter code")),
});

export const updateProfileValidator = z.object({
    first_name: z.string().min(1).max(100).optional(),
    last_name:  z.string().min(1).max(100).optional(),
});

export const forgotPasswordValidator = z.object({
    email: z.email("Invalid email address"),
});

export const resetPasswordValidator = z.object({
    token: z.string().min(1, 'Token is required'),
    new_password: z.string().min(8, "Password must be at least 8 characters"),
});


export type RegisterValidator = z.infer<typeof registerValidator>;
export type LoginValidator = z.infer<typeof loginValidator>;
export type OnboardingValidator = z.infer<typeof onboardingValidator>;
export type OnboardingEventsValidator = z.infer<typeof onboardingEventsValidator>;
export type OnboardingCurrenciesValidator = z.infer<typeof onboardingCurrenciesValidator>;
export type UpdateProfileValidator = z.infer<typeof updateProfileValidator>;
export type ForgotPasswordValidator = z.infer<typeof forgotPasswordValidator>;
export type ResetPasswordValidator = z.infer<typeof resetPasswordValidator>;