export interface Expense {
    id: string;
    user_id: string;
    category_id: string;
    vendor_id: string | null;
    ceremony_id: string;
    name: string;
    planned_amount: number | null;
    actual_amount: number | null;
    base_currency: string;
    refundable_amount: number;
    is_refunded: boolean;
    refunded_at: Date | null;
    notes: string | null;
    is_planned: boolean;
    created_at: Date;
    updated_at: Date;
}
