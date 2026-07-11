import { dbQuery } from '../../config/database/helper/query.helpers';
import { fromAmountInt } from '../../utils/money';
import authRepository from '../auth/repository/auth.repository';
import clientsRepository from '../clients/repository/clients.repository';
import DashboardQueries from './query/dashboard.queries';
import {
    CategoryBreakdown,
    DashboardData,
    DashboardKpis,
    IDashboardService,
    NeedsAttentionItem,
    PaymentProgressItem,
    RawCategoryBreakdown,
    RawDashboardKpis,
    RawDashboardRow,
    RawPaymentProgressItem,
} from './interface/dashboard.interface';

const EMPTY_KPIS: DashboardKpis = {
    total_budget: 0,
    actual_committed: 0,
    total_paid: 0,
    outstanding: 0,
    over_budget_amount: 0,
    pending_refunds: 0,
};

export class DashboardService implements IDashboardService {
    async getDashboard(userId: string, eventId?: string, clientId?: string): Promise<DashboardData> {
        const [row, user] = await Promise.all([
            dbQuery.one<RawDashboardRow>(DashboardQueries.getDashboard, [userId, eventId ?? null, clientId ?? null]),
            authRepository.findById(userId),
        ]);

        const reportingCurrency = clientId
            ? ((await clientsRepository.findById(clientId, userId))?.currency_code ?? user!.base_currency)
            : user!.base_currency;

        const conv = (raw: string | null | undefined): number =>
            raw != null ? fromAmountInt(parseInt(raw, 10), reportingCurrency) : 0;

        const rawKpis: RawDashboardKpis = row.kpis ?? ({} as RawDashboardKpis);
        const kpis: DashboardKpis =
            rawKpis.actual_committed != null
                ? {
                      // total_budget comes from events.budget stored in major units (not yet in minor units)
                      total_budget: parseInt(rawKpis.total_budget ?? '0', 10),
                      actual_committed: conv(rawKpis.actual_committed),
                      total_paid: conv(rawKpis.total_paid),
                      outstanding: conv(rawKpis.outstanding),
                      over_budget_amount: conv(rawKpis.over_budget_amount),
                      pending_refunds: conv(rawKpis.pending_refunds),
                  }
                : EMPTY_KPIS;

        const categories = (row.categories ?? []).map(
            (c: RawCategoryBreakdown): CategoryBreakdown => ({
                category: c.category,
                actual_amount: conv(c.actual_amount),
                planned_amount: c.planned_amount != null ? conv(c.planned_amount) : null,
                total_paid: conv(c.total_paid),
                pct: parseFloat(c.pct),
            }),
        );

        const paymentProgress = (row.payment_progress ?? []).map(
            (p: RawPaymentProgressItem): PaymentProgressItem => ({
                expense_id: p.expense_id,
                name: p.name,
                actual_amount: conv(p.actual_amount),
                total_paid: conv(p.total_paid),
                balance: conv(p.balance),
                pct: parseFloat(p.pct),
            }),
        );

        return {
            kpis,
            bar_chart: categories.map((c) => ({
                category: c.category,
                actual_amount: c.actual_amount,
                planned_amount: c.planned_amount,
                total_paid: c.total_paid,
            })),
            donut_chart: categories.map((c) => ({
                category: c.category,
                amount: c.actual_amount,
                pct: c.pct,
            })),
            payment_progress: paymentProgress,
            needs_attention: (row.needs_attention ?? []) as NeedsAttentionItem[],
        };
    }
}

const dashboardService = new DashboardService();
export default dashboardService;
