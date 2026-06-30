export const PAYMENT_TYPES = [
    { value: 'deposit',      label: 'Deposit' },
    { value: 'balance',      label: 'Balance' },
    { value: 'full_payment', label: 'Full Payment' },
] as const;

export type PaymentTypeValue = typeof PAYMENT_TYPES[number]['value'];
