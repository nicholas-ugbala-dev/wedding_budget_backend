export const BASE_SELECT = `
    SELECT
        e.id, e.user_id, e.name,
        e.ceremony_id, cer.name                                                      AS ceremony_name,
        e.category_id, c.name                                                        AS category_name,
        e.vendor_id,   v.name                                                        AS vendor_name,
        e.planned_amount, e.actual_amount, e.base_currency,
        e.refundable_amount, e.is_refunded, e.refunded_at,
        e.notes, e.is_planned, e.created_at, e.updated_at,
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
    LEFT JOIN ceremonies  cer ON cer.id = e.ceremony_id
    LEFT JOIN categories  c   ON c.id   = e.category_id
    LEFT JOIN vendors     v   ON v.id   = e.vendor_id
    LEFT JOIN payments    p   ON p.expense_id = e.id
`;

// $1 = id | $2 = user_id — returns aggregates + payments JSON array
const findById = `
    SELECT
        e.id, e.user_id, e.name,
        e.ceremony_id, cer.name                                                      AS ceremony_name,
        e.category_id, c.name                                                        AS category_name,
        e.vendor_id,   v.name                                                        AS vendor_name,
        e.planned_amount, e.actual_amount, e.base_currency,
        e.refundable_amount, e.is_refunded, e.refunded_at,
        e.notes, e.is_planned, e.created_at, e.updated_at,
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
                    'wallet_currency_code', uc.currency_code,
                    'wallet_amount',       p.wallet_amount,
                    'exchange_rate',       p.exchange_rate,
                    'base_amount',         p.base_amount,
                    'payment_date',        p.payment_date,
                    'notes',               p.notes,
                    'created_at',          p.created_at,
                    'updated_at',          p.updated_at
                ) ORDER BY p.payment_date DESC
            ) FILTER (WHERE p.id IS NOT NULL AND p.deleted_at IS NULL),
            '[]'
        )                                                                            AS payments
    FROM expenses e
    LEFT JOIN ceremonies     cer ON cer.id = e.ceremony_id
    LEFT JOIN categories     c   ON c.id   = e.category_id
    LEFT JOIN vendors        v   ON v.id   = e.vendor_id
    LEFT JOIN payments       p   ON p.expense_id = e.id
    LEFT JOIN user_currencies uc ON uc.id = p.user_currency_id
    WHERE e.id = $1 AND e.user_id = $2
    GROUP BY e.id, cer.name, c.name, v.name
`;

// Fetch newly created/updated expense with all joins (no payments aggregation)
const findRawById = `
    ${BASE_SELECT}
    WHERE e.id = $1 AND e.user_id = $2
    GROUP BY e.id, cer.name, c.name, v.name
`;

// $1=user_id $2=category_id $3=vendor_id $4=ceremony_id $5=name
// $6=planned_amount $7=actual_amount $8=base_currency $9=refundable_amount $10=is_planned $11=notes
const create = `
    INSERT INTO expenses
        (user_id, category_id, vendor_id, ceremony_id, name,
         planned_amount, actual_amount, base_currency, refundable_amount, is_planned, notes)
    VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)
    RETURNING id
`;

// Full replace — service merges patch with existing before calling
// $1=name $2=ceremony_id $3=category_id $4=vendor_id $5=planned_amount
// $6=actual_amount $7=is_planned $8=notes $9=refundable_amount $10=is_refunded $11=refunded_at
// $12=id $13=user_id
const update = `
    UPDATE expenses
    SET
        name              = $1,
        ceremony_id       = $2,
        category_id       = $3,
        vendor_id         = $4,
        planned_amount    = $5,
        actual_amount     = $6,
        is_planned        = $7,
        notes             = $8,
        refundable_amount = $9,
        is_refunded       = $10,
        refunded_at       = $11
    WHERE id = $12 AND user_id = $13
`;

const remove = `
    DELETE FROM expenses
    WHERE id = $1 AND user_id = $2
`;

const ExpensesQueries = { findById, findRawById, create, update, remove };

export default ExpensesQueries;
