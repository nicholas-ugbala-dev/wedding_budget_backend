const COLS = `id, user_id, first_name, last_name, currency_code, created_at, updated_at`;

const findAll = `
    SELECT ${COLS}
    FROM clients
    WHERE user_id = $1
    ORDER BY created_at ASC
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
