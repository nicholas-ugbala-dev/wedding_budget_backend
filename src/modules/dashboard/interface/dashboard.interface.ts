export interface DashboardKpis {
    total_budget: string;
    actual_committed: string;
    total_paid: string;
    outstanding: string;
    over_budget_amount: string;
    pending_refunds: string;
}

export interface CategoryBreakdown {
    category: string;
    actual_amount: string;
    total_paid: string;
    pct: string;
}

export interface PaymentProgressItem {
    expense_id: string;
    name: string;
    actual_amount: string;
    total_paid: string;
    balance: string;
    pct: string;
}

export type NeedsAttentionBadge =
    | 'missing_info'
    | 'no_vendor'
    | 'unconfirmed'
    | 'pending_refund'
    | 'unpaid'
    | 'balance_due';

export interface NeedsAttentionItem {
    expense_id: string;
    name: string;
    vendor_name: string | null;
    ceremony_name: string | null;
    badge: NeedsAttentionBadge;
}

export interface DashboardData {
    kpis: DashboardKpis;
    bar_chart: Pick<CategoryBreakdown, 'category' | 'actual_amount' | 'total_paid'>[];
    donut_chart: { category: string; amount: string; pct: string }[];
    payment_progress: PaymentProgressItem[];
    needs_attention: NeedsAttentionItem[];
}

export interface IDashboardService {
    getDashboard(userId: string, ceremonyId?: string): Promise<DashboardData>;
}
