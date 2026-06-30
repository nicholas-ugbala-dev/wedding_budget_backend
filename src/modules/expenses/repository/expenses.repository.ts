import { dbQuery } from '../../../config/database/helper/query.helpers';
import { IExpensesRepository, ExpenseRow, ExpenseDetail } from '../interface/expenses.interface';
import { CreateExpenseValidator, UpdateExpenseValidator, ListExpensesValidator } from '../validation/expenses.validations';
import ExpensesQueries, { BASE_SELECT } from '../query/expenses.queries';

const { findById, findRawById, create, update, remove } = ExpensesQueries;

const PAID_SUM = `COALESCE(SUM(p.base_amount) FILTER (WHERE p.deleted_at IS NULL), 0)`;

export class ExpensesRepository implements IExpensesRepository {
    async findAll(userId: string, filters: ListExpensesValidator): Promise<{ rows: ExpenseRow[]; total: number }> {
        const params: (string | number | null)[] = [userId];
        const where: string[] = ['e.user_id = $1'];

        if (filters.ceremony_id) {
            params.push(filters.ceremony_id);
            where.push(`e.ceremony_id = $${params.length}::uuid`);
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
            GROUP BY e.id, cer.name, c.name, v.name
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
        const rows = await dbQuery.manyOrNone<Row>(sql, params) ?? [];
        const total = rows.length ? parseInt(rows[0].total_count, 10) : 0;

        return { rows, total };
    }

    async findById(id: string, userId: string): Promise<ExpenseDetail | null> {
        return dbQuery.oneOrNone<ExpenseDetail>(findById, [id, userId]);
    }

    async findRawById(id: string, userId: string): Promise<ExpenseRow | null> {
        return dbQuery.oneOrNone<ExpenseRow>(findRawById, [id, userId]);
    }

    async create(
        userId: string,
        data: CreateExpenseValidator,
        resolvedCategoryId: string,
        resolvedVendorId: string | null,
    ): Promise<ExpenseRow> {
        const { id } = await dbQuery.one<{ id: string }>(create, [
            userId,
            resolvedCategoryId,
            resolvedVendorId,
            data.ceremony_id,
            data.name,
            data.planned_amount ?? null,
            data.actual_amount ?? null,
            data.base_currency ?? 'NGN',
            data.refundable_amount ?? 0,
            data.is_planned ?? false,
            data.payment_deadline ?? null,
            data.notes ?? null,
        ]);

        return this.findRawById(id, userId) as Promise<ExpenseRow>;
    }

    async update(
        id: string,
        userId: string,
        data: UpdateExpenseValidator,
        existing: ExpenseRow,
    ): Promise<ExpenseRow> {
        const isRefunded = data.is_refunded ?? existing.is_refunded;
        const wasRefunded = existing.is_refunded;
        let refundedAt: Date | null = existing.refunded_at;
        if (isRefunded && !wasRefunded) {
            refundedAt = new Date();
        } else if (!isRefunded && wasRefunded) {
            refundedAt = null;
        }

        await dbQuery.manyOrNone(update, [
            data.name                     ?? existing.name,
            data.ceremony_id              ?? existing.ceremony_id,
            data.category_id              ?? existing.category_id,
            'vendor_id' in data           ? (data.vendor_id ?? null) : existing.vendor_id,
            'planned_amount' in data      ? (data.planned_amount ?? null) : existing.planned_amount,
            'actual_amount'  in data      ? (data.actual_amount  ?? null) : existing.actual_amount,
            data.is_planned               ?? existing.is_planned,
            'notes' in data               ? (data.notes ?? null) : existing.notes,
            data.refundable_amount        ?? existing.refundable_amount,
            isRefunded,
            refundedAt ? refundedAt.toISOString() : null,
            'payment_deadline' in data    ? (data.payment_deadline ?? null) : (existing.payment_deadline ? existing.payment_deadline.toISOString().split('T')[0] : null),
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
