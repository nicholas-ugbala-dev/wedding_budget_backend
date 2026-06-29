export interface Expense {
    id: string;
    user_id: string;
    category_id: string;
    vendor_id: string | null;
    name: string;
    ceremony: string;
    actual_amount: number | null;
    base_currency: string;
    notes: string | null;
    is_planned: boolean;
    created_at: Date;
    updated_at: Date;
}