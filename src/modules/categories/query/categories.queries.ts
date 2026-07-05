// Categories are user-scoped — reusable across clients and events.
// event_id is nullable and kept for reference only.

const BASE_SELECT = `
    SELECT c.id, c.user_id, c.event_id, c.name, c.created_at, c.updated_at
    FROM categories c
`;

// $1 = user_id
const findAll = `
    ${BASE_SELECT}
    WHERE c.user_id = $1
    ORDER BY c.name ASC
`;

// $1 = id | $2 = user_id
const findById = `
    ${BASE_SELECT}
    WHERE c.id = $1 AND c.user_id = $2
`;

// $1 = user_id | $2 = name
const findByName = `
    ${BASE_SELECT}
    WHERE c.user_id = $1
      AND LOWER(c.name) = LOWER($2)
    LIMIT 1
`;

// $1 = user_id | $2 = name
const create = `
    INSERT INTO categories (user_id, name)
    VALUES ($1, $2)
    RETURNING id, user_id, event_id, name, created_at, updated_at
`;

// $1 = name (nullable) | $2 = id | $3 = user_id
const update = `
    UPDATE categories
    SET name = COALESCE($1, name)
    WHERE id = $2 AND user_id = $3
    RETURNING id, user_id, event_id, name, created_at, updated_at
`;

const remove = `
    DELETE FROM categories
    WHERE id = $1 AND user_id = $2
`;

const CategoriesQueries = {
    findAll,
    findById,
    findByName,
    create,
    update,
    remove,
};

export default CategoriesQueries;
