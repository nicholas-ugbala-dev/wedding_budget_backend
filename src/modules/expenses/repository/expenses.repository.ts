import { dbQuery } from '../../../config/database/helper/query.helpers';
import { IExpensesRepository, ExpenseRow, ExpenseDetail, EmbeddedPayment } from '../interface/expenses.interface';
import {
    CreateExpenseValidator,
    UpdateExpenseValidator,
    ListExpensesValidator,
} from '../validation/expenses.validations';
import ExpensesQueries, { BASE_SELECT } from '../query/expenses.queries';
import { toAmountInt, fromAmountInt } from '../../../utils/money';

const { findById, findRawById, create, update, remove } = ExpensesQueries;

const PAID_SUM = `COALESCE(SUM(p.base_amount) FILTER (WHERE p.deleted_at IS NULL), 0)`;

export class ExpensesRepository implements IExpensesRepository {
    private mapRow(row: ExpenseRow): ExpenseRow {
        const bCcy = row.base_currency;
        const repCcy = row.reporting_currency_code;
        return {
            ...row,
            planned_amount: row.planned_amount != null ? fromAmountInt(Number(row.planned_amount), bCcy) : null,
            actual_amount: row.actual_amount != null ? fromAmountInt(Number(row.actual_amount), bCcy) : null,
            refundable_amount: fromAmountInt(Number(row.refundable_amount ?? 0), bCcy),
            reporting_amount:
                row.reporting_amount != null && repCcy != null
                    ? fromAmountInt(Number(row.reporting_amount), repCcy)
                    : null,
            total_paid: fromAmountInt(Number(row.total_paid ?? 0), bCcy),
            balance: fromAmountInt(Number(row.balance ?? 0), bCcy),
        };
    }

    async findAll(userId: string, filters: ListExpensesValidator): Promise<{ rows: ExpenseRow[]; total: number }> {
        const params: (string | number | null)[] = [userId];
        const where: string[] = ['e.user_id = $1'];

        if (filters.event_id) {
            params.push(filters.event_id);
            where.push(`e.event_id = $${params.length}::uuid`);
        }

        if (filters.client_id) {
            params.push(filters.client_id);
            where.push(`ev.client_id = $${params.length}::uuid`);
        }

        if (filters.search) {
            params.push(`%${filters.search}%`);
            where.push(`(e.name ILIKE $${params.length} OR v.name ILIKE $${params.length})`);
        }

        const having: string[] = [];
        if (filters.status === 'unpaid') {
            having.push(`${PAID_SUM} = 0`);
        } else if (filters.status === 'paid') {
            having.push(`${PAID_SUM} >= COALESCE(e.actual_amount, 0)`);
        } else if (filters.status === 'partial') {
            having.push(`${PAID_SUM} > 0`);
            having.push(`${PAID_SUM} < COALESCE(e.actual_amount, 0)`);
        }

        const innerSQL = `
            ${BASE_SELECT}
            WHERE ${where.join(' AND ')}
            GROUP BY e.id, ev.name, ev.client_id, c.name, v.name
            ${having.length ? `HAVING ${having.join(' AND ')}` : ''}
            ORDER BY e.created_at DESC
        `;

        const page = Number(filters.page) || 1;
        const limit = Number(filters.limit) || 10;

        params.push(limit);
        const limitIdx = params.length;
        params.push((page - 1) * limit);
        const offsetIdx = params.length;

        const sql = `
            SELECT *, COUNT(*) OVER() AS total_count
            FROM (${innerSQL}) sub
            LIMIT $${limitIdx} OFFSET $${offsetIdx}
        `;

        type Row = ExpenseRow & { total_count: string };
        const rows = (await dbQuery.manyOrNone<Row>(sql, params)) ?? [];
        const total = rows.length ? parseInt(rows[0].total_count, 10) : 0;

        return { rows: rows.map((r) => this.mapRow(r)), total };
    }

    async findById(id: string, userId: string): Promise<ExpenseDetail | null> {
        const row = await dbQuery.oneOrNone<ExpenseDetail>(findById, [id, userId]);
        if (!row) return null;
        const expense = this.mapRow(row) as ExpenseDetail;
        if (Array.isArray(expense.payments)) {
            const baseCcy = expense.base_currency;
            expense.payments = expense.payments.map((p: EmbeddedPayment) => ({
                ...p,
                wallet_amount: fromAmountInt(Number(p.wallet_amount), p.wallet_currency_code ?? baseCcy),
                base_amount: fromAmountInt(Number(p.base_amount), baseCcy),
                reporting_amount:
                    p.reporting_amount != null && p.reporting_currency_code
                        ? fromAmountInt(Number(p.reporting_amount), p.reporting_currency_code)
                        : null,
            }));
        }
        return expense;
    }

    async findRawById(id: string, userId: string): Promise<ExpenseRow | null> {
        const row = await dbQuery.oneOrNone<ExpenseRow>(findRawById, [id, userId]);
        return row ? this.mapRow(row) : null;
    }

    async create(
        userId: string,
        data: CreateExpenseValidator,
        resolvedCategoryId: string,
        resolvedVendorId: string | null,
        reportingCurrencyCode: string | null,
        reportingAmount: number | null,
    ): Promise<ExpenseRow> {
        const baseCcy = (data.base_currency ?? 'NGN').toUpperCase();
        const { id } = await dbQuery.one<{ id: string }>(create, [
            userId,
            resolvedCategoryId,
            resolvedVendorId,
            data.event_id,
            data.name,
            data.planned_amount != null ? toAmountInt(data.planned_amount, baseCcy) : null,
            data.actual_amount != null ? toAmountInt(data.actual_amount, baseCcy) : null,
            baseCcy,
            toAmountInt(data.refundable_amount ?? 0, baseCcy),
            data.is_planned ?? false,
            data.payment_deadline ?? null,
            data.notes ?? null,
            reportingCurrencyCode,
            reportingAmount != null && reportingCurrencyCode
                ? toAmountInt(reportingAmount, reportingCurrencyCode)
                : null,
        ]);

        return this.findRawById(id, userId) as Promise<ExpenseRow>;
    }

    async update(
        id: string,
        userId: string,
        data: UpdateExpenseValidator,
        existing: ExpenseRow,
        reportingCurrencyCode: string | null | undefined,
        reportingAmount: number | null | undefined,
    ): Promise<ExpenseRow> {
        const isRefunded = data.is_refunded ?? existing.is_refunded;
        const wasRefunded = existing.is_refunded;
        let refundedAt: Date | null = existing.refunded_at;
        if (isRefunded && !wasRefunded) {
            refundedAt = new Date();
        } else if (!isRefunded && wasRefunded) {
            refundedAt = null;
        }

        const baseCcy = (data.base_currency ?? existing.base_currency).toUpperCase();
        const repCcy = reportingCurrencyCode !== undefined ? reportingCurrencyCode : existing.reporting_currency_code;

        // Convert major-unit values → minor units for storage
        const toInt = (val: number | null | undefined): number | null =>
            val != null ? toAmountInt(val, baseCcy) : null;

        const storedReportingAmount =
            reportingAmount !== undefined
                ? reportingAmount != null && repCcy
                    ? toAmountInt(reportingAmount, repCcy)
                    : null
                : existing.reporting_amount != null && existing.reporting_currency_code != null
                  ? toAmountInt(existing.reporting_amount, existing.reporting_currency_code)
                  : null;

        await dbQuery.manyOrNone(update, [
            data.name ?? existing.name,
            baseCcy,
            data.event_id ?? existing.event_id,
            data.category_id ?? existing.category_id,
            'vendor_id' in data ? (data.vendor_id ?? null) : existing.vendor_id,
            toInt('planned_amount' in data ? data.planned_amount : existing.planned_amount),
            toInt('actual_amount' in data ? data.actual_amount : existing.actual_amount),
            data.is_planned ?? existing.is_planned,
            'notes' in data ? (data.notes ?? null) : existing.notes,
            toAmountInt(data.refundable_amount ?? existing.refundable_amount ?? 0, baseCcy),
            isRefunded,
            refundedAt ? refundedAt.toISOString() : null,
            'payment_deadline' in data
                ? (data.payment_deadline ?? null)
                : existing.payment_deadline
                  ? existing.payment_deadline.toISOString().split('T')[0]
                  : null,
            repCcy,
            storedReportingAmount,
            id,
            userId,
        ]);

        return this.findRawById(id, userId) as Promise<ExpenseRow>;
    }

    async delete(id: string, userId: string): Promise<void> {
        await dbQuery.manyOrNone(remove, [id, userId]);
    }
}

const expensesRepository = new ExpensesRepository();
export default expensesRepository;
