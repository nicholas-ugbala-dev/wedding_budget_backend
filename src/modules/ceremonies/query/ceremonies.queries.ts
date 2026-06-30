const findAll = `
    SELECT id, user_id, name, created_at
    FROM ceremonies
    WHERE user_id = $1
    ORDER BY created_at ASC
`;

const findById = `
    SELECT id, user_id, name, created_at
    FROM ceremonies
    WHERE id = $1 AND user_id = $2
`;

const create = `
    INSERT INTO ceremonies (user_id, name)
    VALUES ($1, $2)
    RETURNING id, user_id, name, created_at
`;

const update = `
    UPDATE ceremonies
    SET name = $1
    WHERE id = $2 AND user_id = $3
    RETURNING id, user_id, name, created_at
`;

const remove = `
    DELETE FROM ceremonies
    WHERE id = $1 AND user_id = $2
`;

const CeremoniesQueries = { findAll, findById, create, update, remove };

export default CeremoniesQueries;
