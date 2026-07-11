export interface DashboardKpis {
    total_budget: number;
    actual_committed: number;
    total_paid: number;
    outstanding: number;
    over_budget_amount: number;
    pending_refunds: number;
}

export interface CategoryBreakdown {
    category: string;
    actual_amount: number;
    planned_amount: number | null;
    total_paid: number;
    pct: number;
}

export interface PaymentProgressItem {
    expense_id: string;
    name: string;
    actual_amount: number;
    total_paid: number;
    balance: number;
    pct: number;
}

export type NeedsAttentionBadge =
    'missing_info' | 'no_vendor' | 'unconfirmed' | 'pending_refund' | 'unpaid' | 'balance_due';

export interface NeedsAttentionItem {
    expense_id: string;
    name: string;
    vendor_name: string | null;
    ceremony_name: string | null;
    badge: NeedsAttentionBadge;
}

export interface DashboardData {
    kpis: DashboardKpis;
    bar_chart: Pick<CategoryBreakdown, 'category' | 'actual_amount' | 'planned_amount' | 'total_paid'>[];
    donut_chart: { category: string; amount: number; pct: number }[];
    payment_progress: PaymentProgressItem[];
    needs_attention: NeedsAttentionItem[];
}

export interface IDashboardService {
    getDashboard(userId: string, eventId?: string, clientId?: string): Promise<DashboardData>;
}

// Raw shapes as returned by PostgreSQL — BIGINT columns come back as strings
export interface RawDashboardKpis {
    total_budget: string;
    actual_committed: string;
    total_paid: string;
    outstanding: string;
    over_budget_amount: string;
    pending_refunds: string;
}

export interface RawCategoryBreakdown {
    category: string;
    actual_amount: string;
    planned_amount: string | null;
    total_paid: string;
    pct: string;
}

export interface RawPaymentProgressItem {
    expense_id: string;
    name: string;
    actual_amount: string;
    total_paid: string;
    balance: string;
    pct: string;
}

export interface RawDashboardRow {
    kpis: RawDashboardKpis;
    categories: RawCategoryBreakdown[] | null;
    payment_progress: RawPaymentProgressItem[] | null;
    needs_attention: NeedsAttentionItem[] | null;
}
