export interface Payment {
    id: string;
    expense_id: string;
    payment_type: string;
    user_currency_id: string;
    wallet_amount: number;
    exchange_rate: number | null;
    base_amount: number;
    payment_date: Date;
    notes: string | null;
    deleted_at: Date | null;
    created_at: Date;
    updated_at: Date;
}