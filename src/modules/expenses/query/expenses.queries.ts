export const BASE_SELECT = `
    SELECT
        e.id, e.user_id, e.name,
        e.event_id, ev.name                                                       AS event_name,
        ev.client_id,
        e.category_id, c.name                                                        AS category_name,
        e.vendor_id,   v.name                                                        AS vendor_name,
        e.planned_amount, e.actual_amount, e.base_currency,
        e.reporting_currency_code, e.reporting_amount,
        e.refundable_amount, e.is_refunded, e.refunded_at,
        e.notes, e.is_planned, e.payment_deadline, e.created_at, e.updated_at,
        COALESCE(SUM(p.base_amount) FILTER (WHERE p.deleted_at IS NULL), 0)          AS total_paid,
        COALESCE(e.actual_amount, 0)
            - COALESCE(SUM(p.base_amount) FILTER (WHERE p.deleted_at IS NULL), 0)   AS balance,
        CASE
            WHEN COALESCE(SUM(p.base_amount) FILTER (WHERE p.deleted_at IS NULL), 0) = 0
                THEN 'unpaid'
            WHEN COALESCE(SUM(p.base_amount) FILTER (WHERE p.deleted_at IS NULL), 0)
                >= COALESCE(e.actual_amount, 0)
                THEN 'paid'
            ELSE 'partial'
        END                                                                          AS status
    FROM expenses e
    LEFT JOIN events      ev  ON ev.id  = e.event_id
    LEFT JOIN categories  c   ON c.id   = e.category_id
    LEFT JOIN vendors     v   ON v.id   = e.vendor_id
    LEFT JOIN payments    p   ON p.expense_id = e.id
`;

// $1 = id | $2 = user_id — returns aggregates + payments JSON array
const findById = `
    SELECT
        e.id, e.user_id, e.name,
        e.event_id, ev.name                                                       AS event_name,
        ev.client_id,
        e.category_id, c.name                                                        AS category_name,
        e.vendor_id,   v.name                                                        AS vendor_name,
        e.planned_amount, e.actual_amount, e.base_currency,
        e.reporting_currency_code, e.reporting_amount,
        e.refundable_amount, e.is_refunded, e.refunded_at,
        e.notes, e.is_planned, e.payment_deadline, e.created_at, e.updated_at,
        COALESCE(SUM(p.base_amount) FILTER (WHERE p.deleted_at IS NULL), 0)          AS total_paid,
        COALESCE(e.actual_amount, 0)
            - COALESCE(SUM(p.base_amount) FILTER (WHERE p.deleted_at IS NULL), 0)   AS balance,
        CASE
            WHEN COALESCE(SUM(p.base_amount) FILTER (WHERE p.deleted_at IS NULL), 0) = 0
                THEN 'unpaid'
            WHEN COALESCE(SUM(p.base_amount) FILTER (WHERE p.deleted_at IS NULL), 0)
                >= COALESCE(e.actual_amount, 0)
                THEN 'paid'
            ELSE 'partial'
        END                                                                          AS status,
        COALESCE(
            json_agg(
                json_build_object(
                    'id',                  p.id,
                    'expense_id',          p.expense_id,
                    'payment_type',        p.payment_type,
                    'user_currency_id',    p.user_currency_id,
                    'wallet_currency_code',    COALESCE(uc.currency_code, p.wallet_currency_code),
                    'wallet_amount',           p.wallet_amount,
                    'exchange_rate',           CASE WHEN p.exchange_rate IS NOT NULL THEN p.exchange_rate::float8 / 1000000 ELSE NULL END,
                    'base_amount',             p.base_amount,
                    'reporting_currency_code', p.reporting_currency_code,
                    'reporting_amount',        p.reporting_amount,
                    'payment_date',            p.payment_date,
                    'notes',                   p.notes,
                    'created_at',              p.created_at,
                    'updated_at',              p.updated_at
                ) ORDER BY p.payment_date DESC
            ) FILTER (WHERE p.id IS NOT NULL AND p.deleted_at IS NULL),
            '[]'
        )                                                                            AS payments
    FROM expenses e
    LEFT JOIN events         ev  ON ev.id  = e.event_id
    LEFT JOIN categories     c   ON c.id   = e.category_id
    LEFT JOIN vendors        v   ON v.id   = e.vendor_id
    LEFT JOIN payments       p   ON p.expense_id = e.id
    LEFT JOIN user_currencies uc ON uc.id = p.user_currency_id
    WHERE e.id = $1 AND e.user_id = $2
    GROUP BY e.id, ev.name, ev.client_id, c.name, v.name
`;

// Fetch newly created/updated expense with all joins (no payments aggregation)
const findRawById = `
    ${BASE_SELECT}
    WHERE e.id = $1 AND e.user_id = $2
    GROUP BY e.id, ev.name, ev.client_id, c.name, v.name
`;

// $1=user_id $2=category_id $3=vendor_id $4=event_id $5=name
// $6=planned_amount $7=actual_amount $8=base_currency $9=refundable_amount $10=is_planned $11=payment_deadline $12=notes
// $13=reporting_currency_code $14=reporting_amount
const create = `
    INSERT INTO expenses
        (user_id, category_id, vendor_id, event_id, name,
         planned_amount, actual_amount, base_currency, refundable_amount, is_planned, payment_deadline, notes,
         reporting_currency_code, reporting_amount)
    VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14)
    RETURNING id
`;

// Full replace — service merges patch with existing before calling
// $1=name $2=base_currency $3=event_id $4=category_id $5=vendor_id $6=planned_amount
// $7=actual_amount $8=is_planned $9=notes $10=refundable_amount $11=is_refunded $12=refunded_at
// $13=payment_deadline $14=reporting_currency_code $15=reporting_amount $16=id $17=user_id
const update = `
    UPDATE expenses
    SET
        name                    = $1,
        base_currency           = $2,
        event_id                = $3,
        category_id             = $4,
        vendor_id               = $5,
        planned_amount          = $6,
        actual_amount           = $7,
        is_planned              = $8,
        notes                   = $9,
        refundable_amount       = $10,
        is_refunded             = $11,
        refunded_at             = $12,
        payment_deadline        = $13,
        reporting_currency_code = $14,
        reporting_amount        = $15
    WHERE id = $16 AND user_id = $17
`;

const remove = `
    DELETE FROM expenses
    WHERE id = $1 AND user_id = $2
`;

const ExpensesQueries = { findById, findRawById, create, update, remove };

export default ExpensesQueries;
