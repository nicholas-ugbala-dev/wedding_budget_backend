import { dbQuery } from '../../../config/database/helper/query.helpers';
import { IPaymentsRepository, PaymentRow, PaymentSummary } from '../interface/payments.interface';
import { CreatePaymentValidator, ListPaymentsValidator, UpdatePaymentValidator } from '../validation/payments.validations';
import PaymentsQueries, { BASE_SELECT } from '../query/payments.queries';
import { toRateInt } from '../../../utils/money';

const { findById, create, softDelete, summary, buildUpdate } = PaymentsQueries;

export class PaymentsRepository implements IPaymentsRepository {
    async findAll(userId: string, filters: ListPaymentsValidator): Promise<{ rows: PaymentRow[]; total: number }> {
        const params: (string | number | null)[] = [userId];
        const where: string[] = ['e.user_id = $1', 'p.deleted_at IS NULL'];

        if (filters.event_id) {
            params.push(filters.event_id);
            where.push(`e.event_id = $${params.length}::uuid`);
        }

        if (filters.client_id) {
            params.push(filters.client_id);
            where.push(`ev.client_id = $${params.length}::uuid`);
        }

        if (filters.expense_id) {
            params.push(filters.expense_id);
            where.push(`p.expense_id = $${params.length}::uuid`);
        }

        const innerSQL = `
            ${BASE_SELECT}
            WHERE ${where.join(' AND ')}
            ORDER BY p.payment_date DESC
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

        type Row = PaymentRow & { total_count: string };
        const rows = await dbQuery.manyOrNone<Row>(sql, params) ?? [];
        const total = rows.length ? parseInt(rows[0].total_count, 10) : 0;

        return { rows, total };
    }

    async findById(id: string, expenseId: string, userId: string): Promise<PaymentRow | null> {
        return dbQuery.oneOrNone<PaymentRow>(findById, [id, expenseId, userId]);
    }

    async getSummary(userId: string, eventId?: string, clientId?: string): Promise<PaymentSummary> {
        const params: (string | null)[] = [userId];
        const filters: string[] = [];

        if (eventId) {
            params.push(eventId);
            filters.push(`AND e.event_id = $${params.length}::uuid`);
        }
        if (clientId) {
            params.push(clientId);
            filters.push(`AND ev.client_id = $${params.length}::uuid`);
        }

        type RawRow = {
            total_paid: string;
            outstanding: string;
            fully_paid_count: number;
            total_expenses: number;
        };

        const row = await dbQuery.oneOrNone<RawRow>(summary(filters.join(' ')), params);
        if (!row) return { total_paid: 0, outstanding: 0, fully_paid_count: 0, total_expenses: 0 };

        return {
            total_paid: parseInt(row.total_paid, 10),
            outstanding: parseInt(row.outstanding, 10),
            fully_paid_count: row.fully_paid_count,
            total_expenses: row.total_expenses,
        };
    }

    async create(
        expenseId: string,
        userId: string,
        data: CreatePaymentValidator,
        walletCurrencyCode: string,
        resolvedBaseAmount: number,
        resolvedExchangeRate: number | null,
        reportingCurrencyCode: string | null,
        reportingAmount: number | null,
    ): Promise<PaymentRow> {
        const { id } = await dbQuery.one<{ id: string }>(create, [
            expenseId,
            data.payment_type,
            data.user_currency_id ?? null,
            walletCurrencyCode,
            data.wallet_amount,
            resolvedExchangeRate != null ? toRateInt(resolvedExchangeRate) : null,
            resolvedBaseAmount,
            data.payment_date,
            data.notes ?? null,
            reportingCurrencyCode,
            reportingAmount,
        ]);

        return this.findById(id, expenseId, userId) as Promise<PaymentRow>;
    }

    async update(id: string, expenseId: string, userId: string, data: UpdatePaymentValidator, walletCurrencyCode?: string, reportingCurrencyCode?: string | null, reportingAmount?: number | null): Promise<PaymentRow> {
        const params: (string | number | null)[] = [id, expenseId, userId];
        const fields: string[] = [];

        const addField = (col: string, val: string | number | null | undefined) => {
            if (val === undefined) return;
            params.push(val);
            fields.push(`${col} = $${params.length}`);
        };

        addField('payment_type', data.payment_type ?? undefined);

        if (data.wallet_currency_code !== undefined) {
            // Planner flow: store code directly, clear user_currency_id
            addField('wallet_currency_code', data.wallet_currency_code);
            addField('user_currency_id', null);
        } else if (data.user_currency_id !== undefined) {
            // Couple flow: set user_currency_id and derived code
            addField('user_currency_id', data.user_currency_id ?? undefined);
            if (walletCurrencyCode) addField('wallet_currency_code', walletCurrencyCode);
        }

        addField('wallet_amount', data.wallet_amount ?? undefined);
        addField('exchange_rate', data.exchange_rate !== undefined ? (data.exchange_rate != null ? toRateInt(data.exchange_rate) : null) : undefined);
        addField('base_amount', data.base_amount ?? undefined);
        addField('payment_date', data.payment_date ?? undefined);
        addField('notes', data.notes !== undefined ? (data.notes ?? null) : undefined);
        if (reportingCurrencyCode !== undefined) addField('reporting_currency_code', reportingCurrencyCode);
        if (reportingAmount !== undefined) addField('reporting_amount', reportingAmount);

        const { id: updatedId } = await dbQuery.one<{ id: string }>(buildUpdate(fields), params);
        return this.findById(updatedId, expenseId, userId) as Promise<PaymentRow>;
    }

    async softDelete(id: string, expenseId: string, userId: string): Promise<void> {
        await dbQuery.manyOrNone(softDelete, [id, expenseId, userId]);
    }
}

const paymentsRepository = new PaymentsRepository();
export default paymentsRepository;
