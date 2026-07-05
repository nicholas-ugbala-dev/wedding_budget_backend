const COLS = `id, user_id, first_name, last_name, currency_code, created_at, updated_at`;

// $1 = user_id | optional $2 = search pattern | then $limit $offset
const findAll = (hasSearch: boolean) => `
    SELECT
        c.id, c.user_id, c.first_name, c.last_name, c.currency_code,
        c.created_at, c.updated_at,
        (SELECT e.name FROM events e
         WHERE e.client_id = c.id AND e.date >= CURRENT_DATE
         ORDER BY e.date ASC LIMIT 1) AS next_event_name,
        (SELECT e.date::text FROM events e
         WHERE e.client_id = c.id AND e.date >= CURRENT_DATE
         ORDER BY e.date ASC LIMIT 1) AS next_event_date,
        COALESCE((SELECT SUM(e.budget) FROM events e WHERE e.client_id = c.id), 0) AS total_budget,
        COUNT(*) OVER() AS total_count
    FROM clients c
    WHERE c.user_id = $1
    ${hasSearch ? 'AND (c.first_name ILIKE $2 OR c.last_name ILIKE $2)' : ''}
    ORDER BY c.created_at ASC
    LIMIT ${hasSearch ? '$3' : '$2'} OFFSET ${hasSearch ? '$4' : '$3'}
`;

const findById = `
    SELECT ${COLS}
    FROM clients
    WHERE id = $1 AND user_id = $2
`;

const create = `
    INSERT INTO clients (user_id, first_name, last_name, currency_code)
    VALUES ($1, $2, $3, $4)
    RETURNING ${COLS}
`;

const update = `
    UPDATE clients SET
        first_name    = COALESCE($1, first_name),
        last_name     = COALESCE($2, last_name),
        currency_code = COALESCE($3, currency_code),
        updated_at    = NOW()
    WHERE id = $4 AND user_id = $5
    RETURNING ${COLS}
`;

const remove = `
    DELETE FROM clients
    WHERE id = $1 AND user_id = $2
`;

const ClientsQueries = { findAll, findById, create, update, remove };

export default ClientsQueries;
