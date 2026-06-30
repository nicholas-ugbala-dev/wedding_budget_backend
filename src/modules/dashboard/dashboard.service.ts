import { dbQuery } from '../../config/database/helper/query.helpers';
import DashboardQueries from './query/dashboard.queries';
import {
    CategoryBreakdown,
    DashboardData,
    DashboardKpis,
    IDashboardService,
    NeedsAttentionItem,
    PaymentProgressItem,
} from './interface/dashboard.interface';

const EMPTY_KPIS: DashboardKpis = {
    total_budget: '0',
    actual_committed: '0',
    total_paid: '0',
    outstanding: '0',
    over_budget_amount: '0',
    pending_refunds: '0',
};

interface RawDashboardRow {
    kpis: DashboardKpis;
    categories: CategoryBreakdown[] | null;
    payment_progress: PaymentProgressItem[] | null;
    needs_attention: NeedsAttentionItem[] | null;
}

export class DashboardService implements IDashboardService {
    async getDashboard(userId: string, ceremonyId?: string): Promise<DashboardData> {
        const row = await dbQuery.one<RawDashboardRow>(DashboardQueries.getDashboard, [
            userId,
            ceremonyId ?? null,
        ]);

        const kpis = row.kpis ?? EMPTY_KPIS;
        const categories = row.categories ?? [];

        return {
            kpis,
            bar_chart: categories.map(c => ({
                category: c.category,
                actual_amount: c.actual_amount,
                total_paid: c.total_paid,
            })),
            donut_chart: categories.map(c => ({
                category: c.category,
                amount: c.actual_amount,
                pct: c.pct,
            })),
            payment_progress: row.payment_progress ?? [],
            needs_attention: row.needs_attention ?? [],
        };
    }
}

const dashboardService = new DashboardService();
export default dashboardService;
