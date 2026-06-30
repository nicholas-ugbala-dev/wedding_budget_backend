// $1 = user_id  $2 = ceremony_id (uuid | null — null means all ceremonies)
const getDashboard = `
    WITH
    filtered_expenses AS MATERIALIZED (
        SELECT
            e.id,
            e.name,
            e.ceremony_id,
            e.category_id,
            e.vendor_id,
            e.actual_amount,
            e.planned_amount,
            e.refundable_amount,
            e.is_refunded,
            e.is_planned,
            e.payment_deadline
        FROM expenses e
        WHERE e.user_id = $1
          AND ($2::uuid IS NULL OR e.ceremony_id = $2::uuid)
    ),
    expense_totals AS (
        SELECT
            fe.*,
            COALESCE(SUM(p.base_amount) FILTER (WHERE p.deleted_at IS NULL), 0) AS total_paid
        FROM filtered_expenses fe
        LEFT JOIN payments p ON p.expense_id = fe.id
        GROUP BY
            fe.id, fe.name, fe.ceremony_id, fe.category_id,
            fe.vendor_id, fe.actual_amount, fe.planned_amount,
            fe.refundable_amount, fe.is_refunded, fe.is_planned, fe.payment_deadline
    ),
    kpis AS (
        SELECT
            COALESCE(SUM(COALESCE(planned_amount, actual_amount)), 0)             AS total_budget,
            COALESCE(SUM(actual_amount)  FILTER (WHERE is_planned = false), 0)   AS actual_committed,
            COALESCE(SUM(total_paid), 0)                                          AS total_paid,
            GREATEST(0,
                COALESCE(SUM(actual_amount) FILTER (WHERE is_planned = false), 0)
                - COALESCE(SUM(total_paid), 0)
            )                                                                     AS outstanding,
            GREATEST(0,
                COALESCE(SUM(actual_amount) FILTER (WHERE is_planned = false), 0)
                - COALESCE(SUM(COALESCE(planned_amount, actual_amount)), 0)
            )                                                                     AS over_budget_amount,
            COALESCE(SUM(refundable_amount) FILTER (WHERE is_refunded = false AND refundable_amount > 0), 0) AS pending_refunds
        FROM expense_totals
    ),
    by_category AS (
        SELECT
            c.name                                AS category,
            SUM(et.actual_amount)                 AS actual_amount,
            SUM(et.total_paid)                    AS total_paid,
            ROUND(
                SUM(et.actual_amount) * 100.0
                / NULLIF(SUM(SUM(et.actual_amount)) OVER (), 0),
                1
            )                                     AS pct
        FROM expense_totals et
        JOIN categories c ON c.id = et.category_id
        GROUP BY c.name
    ),
    payment_progress AS (
        SELECT
            id                                                      AS expense_id,
            name,
            actual_amount,
            total_paid,
            GREATEST(0, actual_amount - total_paid)                 AS balance,
            CASE
                WHEN actual_amount = 0 THEN 0
                ELSE ROUND(total_paid * 100.0 / actual_amount, 0)
            END                                                     AS pct
        FROM expense_totals
    ),
    needs_attention AS (
        SELECT
            et.id        AS expense_id,
            et.name,
            v.name       AS vendor_name,
            cer.name     AS ceremony_name,
            CASE
                WHEN et.vendor_id IS NULL AND (et.actual_amount IS NULL OR et.actual_amount = 0)
                    THEN 'Missing info'
                WHEN et.vendor_id IS NULL
                    THEN 'No vendor'
                WHEN et.is_planned = true
                    THEN 'Unconfirmed'
                WHEN et.refundable_amount > 0 AND et.is_refunded = false
                    THEN 'Pending refund'
                WHEN et.total_paid = 0 AND et.actual_amount > 0
                    THEN 'Unpaid'
                WHEN et.actual_amount > et.total_paid
                    AND et.payment_deadline IS NOT NULL
                    AND et.payment_deadline < CURRENT_DATE
                    THEN 'Balance due'
            END          AS badge
        FROM expense_totals et
        LEFT JOIN vendors    v   ON v.id   = et.vendor_id
        LEFT JOIN ceremonies cer ON cer.id = et.ceremony_id
        WHERE
            et.vendor_id IS NULL
            OR et.is_planned = true
            OR (et.refundable_amount > 0 AND et.is_refunded = false)
            OR et.total_paid < et.actual_amount
        LIMIT 15
    )
    SELECT
        (SELECT row_to_json(k) FROM kpis k)                                                      AS kpis,
        (SELECT json_agg(b ORDER BY b.actual_amount DESC) FROM by_category b)                    AS categories,
        (SELECT json_agg(pp ORDER BY pp.pct ASC NULLS LAST) FROM payment_progress pp)            AS payment_progress,
        (SELECT json_agg(na) FROM needs_attention na WHERE na.badge IS NOT NULL)                  AS needs_attention
`;

const DashboardQueries = { getDashboard };

export default DashboardQueries;
