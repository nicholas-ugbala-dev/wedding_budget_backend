const COLS = `id, user_id, name, event_type, date, location, vendor_currency, budget, client_id, created_at`;

const findAll = `
    SELECT ${COLS}
    FROM events
    WHERE user_id = $1
    ORDER BY created_at ASC
`;

const findById = `
    SELECT ${COLS}
    FROM events
    WHERE id = $1 AND user_id = $2
`;

const create = `
    INSERT INTO events (user_id, name, event_type, date, location, vendor_currency, budget, client_id)
    VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
    RETURNING ${COLS}
`;

const update = `
    UPDATE events SET
        name            = COALESCE($1, name),
        event_type      = COALESCE($2, event_type),
        date            = COALESCE($3, date),
        location        = COALESCE($4, location),
        vendor_currency = COALESCE($5, vendor_currency),
        budget          = COALESCE($6, budget),
        client_id       = COALESCE($7, client_id)
    WHERE id = $8 AND user_id = $9
    RETURNING ${COLS}
`;

const remove = `
    DELETE FROM events
    WHERE id = $1 AND user_id = $2
`;

const EventsQueries = { findAll, findById, create, update, remove };

export default EventsQueries;
