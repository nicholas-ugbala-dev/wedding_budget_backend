const findAll = `
    SELECT id, user_id, name, created_at
    FROM events
    WHERE user_id = $1
    ORDER BY created_at ASC
`;

const findById = `
    SELECT id, user_id, name, created_at
    FROM events
    WHERE id = $1 AND user_id = $2
`;

const create = `
    INSERT INTO events (user_id, name)
    VALUES ($1, $2)
    RETURNING id, user_id, name, created_at
`;

const update = `
    UPDATE events
    SET name = $1
    WHERE id = $2 AND user_id = $3
    RETURNING id, user_id, name, created_at
`;

const remove = `
    DELETE FROM events
    WHERE id = $1 AND user_id = $2
`;

const EventsQueries = { findAll, findById, create, update, remove };

export default EventsQueries;
