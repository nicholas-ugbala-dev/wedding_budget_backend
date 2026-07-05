export const BASE_SELECT = `
    SELECT
        p.id, p.expense_id, e.name         AS expense_name,
        e.event_id, ev.name             AS event_name,
        p.payment_type,
        p.user_currency_id,
        COALESCE(uc.currency_code, p.wallet_currency_code) AS wallet_currency_code,
        p.wallet_amount,
        CASE WHEN p.exchange_rate IS NOT NULL THEN p.exchange_rate::float8 / 1000000 ELSE NULL END AS exchange_rate,
        p.base_amount,
        e.base_currency AS expense_base_currency,
        p.reporting_currency_code, p.reporting_amount,
        p.payment_date, p.notes,
        p.created_at, p.updated_at
    FROM payments p
    JOIN expenses e ON e.id = p.expense_id
    LEFT JOIN events          ev  ON ev.id  = e.event_id
    LEFT JOIN user_currencies uc  ON uc.id  = p.user_currency_id
`;

// $1 = id | $2 = expense_id | $3 = user_id
const findById = `
    ${BASE_SELECT}
    WHERE p.id = $1 AND p.expense_id = $2 AND e.user_id = $3 AND p.deleted_at IS NULL
`;

// $1 = expense_id | $2 = payment_type | $3 = user_currency_id | $4 = wallet_currency_code
// $5 = wallet_amount | $6 = exchange_rate | $7 = base_amount | $8 = payment_date | $9 = notes
// $10 = reporting_currency_code | $11 = reporting_amount
const create = `
    INSERT INTO payments
        (expense_id, payment_type, user_currency_id, wallet_currency_code, wallet_amount, exchange_rate, base_amount, payment_date, notes,
         reporting_currency_code, reporting_amount)
    VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)
    RETURNING id
`;

// $1 = id | $2 = expense_id | $3 = user_id
const softDelete = `
    UPDATE payments
    SET deleted_at = NOW()
    WHERE id = $1
      AND expense_id = $2
      AND EXISTS (SELECT 1 FROM expenses WHERE id = $2 AND user_id = $3)
`;

// $1 = user_id | optional $2 = event_id | optional $3 = client_id (appended dynamically)
const summary = (filters: string) => `
    WITH expense_totals AS (
        SELECT
            e.id,
            COALESCE(e.reporting_amount, e.actual_amount, 0)                                                           AS reporting_actual,
            COALESCE(SUM(COALESCE(p.reporting_amount, p.base_amount)) FILTER (WHERE p.deleted_at IS NULL), 0)          AS total_paid
        FROM expenses e
        LEFT JOIN events ev ON ev.id = e.event_id
        LEFT JOIN payments p ON p.expense_id = e.id
        WHERE e.user_id = $1 ${filters}
        GROUP BY e.id, e.actual_amount, e.reporting_amount
    )
    SELECT
        COALESCE(SUM(total_paid), 0)::bigint                                                                           AS total_paid,
        COALESCE(SUM(GREATEST(reporting_actual - total_paid, 0)), 0)::bigint                                           AS outstanding,
        COUNT(*) FILTER (WHERE total_paid >= reporting_actual AND reporting_actual > 0)::int                            AS fully_paid_count,
        COUNT(*)::int                                                                                                   AS total_expenses
    FROM expense_totals
`;

// $1 = id | $2 = expense_id | $3 = user_id | returns updated row id
const buildUpdate = (fields: string[]) => `
    UPDATE payments p
    SET ${fields.join(', ')}, updated_at = NOW()
    WHERE p.id = $1
      AND p.expense_id = $2
      AND EXISTS (SELECT 1 FROM expenses WHERE id = $2 AND user_id = $3)
      AND p.deleted_at IS NULL
    RETURNING p.id
`;

const PaymentsQueries = { findById, create, softDelete, summary, buildUpdate };
export default PaymentsQueries;
