// $1 = user_id  $2 = event_id (uuid | null)  $3 = client_id (uuid | null)
const getDashboard = `
    WITH
    event_budgets AS (
        SELECT COALESCE(SUM(ev.budget), 0) AS total_budget
        FROM events ev
        WHERE ev.user_id = $1
          AND ($2::uuid IS NULL OR ev.id = $2::uuid)
          AND ($3::uuid IS NULL OR ev.client_id = $3::uuid)
    ),
    filtered_expenses AS MATERIALIZED (
        SELECT
            e.id,
            e.name,
            e.event_id,
            e.category_id,
            e.vendor_id,
            e.actual_amount,
            e.reporting_amount,
            e.planned_amount,
            e.refundable_amount,
            e.is_refunded,
            e.is_planned,
            e.payment_deadline
        FROM expenses e
        LEFT JOIN events ev ON ev.id = e.event_id
        WHERE e.user_id = $1
          AND ($2::uuid IS NULL OR e.event_id = $2::uuid)
          AND ($3::uuid IS NULL OR ev.client_id = $3::uuid)
    ),
    expense_totals AS (
        SELECT
            fe.*,
            COALESCE(fe.reporting_amount, fe.actual_amount)                                                    AS reporting_actual,
            COALESCE(SUM(COALESCE(p.reporting_amount, p.base_amount)) FILTER (WHERE p.deleted_at IS NULL), 0) AS total_paid
        FROM filtered_expenses fe
        LEFT JOIN payments p ON p.expense_id = fe.id
        GROUP BY
            fe.id, fe.name, fe.event_id, fe.category_id,
            fe.vendor_id, fe.actual_amount, fe.reporting_amount, fe.planned_amount,
            fe.refundable_amount, fe.is_refunded, fe.is_planned, fe.payment_deadline
    ),
    kpis AS (
        SELECT
            (SELECT total_budget FROM event_budgets)                                               AS total_budget,
            COALESCE(SUM(reporting_actual) FILTER (WHERE is_planned = false), 0)                  AS actual_committed,
            COALESCE(SUM(total_paid), 0)                                                          AS total_paid,
            GREATEST(0,
                COALESCE(SUM(reporting_actual) FILTER (WHERE is_planned = false), 0)
                - COALESCE(SUM(total_paid), 0)
            )                                                                                     AS outstanding,
            GREATEST(0,
                COALESCE(SUM(reporting_actual) FILTER (WHERE is_planned = false), 0)
                - (SELECT total_budget FROM event_budgets)
            )                                                                                     AS over_budget_amount,
            COALESCE(SUM(
                CASE
                    WHEN is_refunded = false AND refundable_amount > 0 AND actual_amount > 0 AND reporting_amount IS NOT NULL
                        THEN ROUND(refundable_amount::float8 * reporting_amount / actual_amount)
                    WHEN is_refunded = false AND refundable_amount > 0
                        THEN refundable_amount
                    ELSE 0
                END
            ), 0)                                                                                             AS pending_refunds
        FROM expense_totals
    ),
    by_category AS (
        SELECT
            c.name                                AS category,
            SUM(et.reporting_actual)              AS actual_amount,
            SUM(et.planned_amount)                AS planned_amount,
            SUM(et.total_paid)                    AS total_paid,
            ROUND(
                SUM(et.reporting_actual) * 100.0
                / NULLIF(SUM(SUM(et.reporting_actual)) OVER (), 0),
                1
            )                                     AS pct
        FROM expense_totals et
        JOIN categories c ON c.id = et.category_id
        GROUP BY c.name
    ),
    payment_progress AS (
        SELECT
            id                                                          AS expense_id,
            name,
            reporting_actual                                            AS actual_amount,
            total_paid,
            GREATEST(0, reporting_actual - total_paid)                  AS balance,
            CASE
                WHEN reporting_actual = 0 THEN 0
                ELSE ROUND(total_paid * 100.0 / reporting_actual, 0)
            END                                                         AS pct
        FROM expense_totals
    ),
    needs_attention AS (
        SELECT
            et.id        AS expense_id,
            et.name,
            v.name       AS vendor_name,
            ev.name      AS event_name,
            CASE
                WHEN et.vendor_id IS NULL AND (et.actual_amount IS NULL OR et.actual_amount = 0)
                    THEN 'missing_info'
                WHEN et.vendor_id IS NULL
                    THEN 'no_vendor'
                WHEN et.is_planned = true
                    THEN 'unconfirmed'
                WHEN et.refundable_amount > 0 AND et.is_refunded = false
                    THEN 'pending_refund'
                WHEN et.total_paid = 0 AND et.reporting_actual > 0
                    THEN 'unpaid'
                WHEN et.reporting_actual > et.total_paid
                    AND et.payment_deadline IS NOT NULL
                    AND et.payment_deadline < CURRENT_DATE
                    THEN 'balance_due'
            END          AS badge
        FROM expense_totals et
        LEFT JOIN vendors    v   ON v.id   = et.vendor_id
        LEFT JOIN events     ev  ON ev.id  = et.event_id
        WHERE
            et.vendor_id IS NULL
            OR et.is_planned = true
            OR (et.refundable_amount > 0 AND et.is_refunded = false)
            OR et.total_paid < et.reporting_actual
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
