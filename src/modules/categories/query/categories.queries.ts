const findAll = `
    SELECT id, user_id, name, ceremony, created_at, updated_at
    FROM categories
    WHERE user_id = $1
      AND ($2::text IS NULL OR ceremony = $2)
    ORDER BY ceremony ASC, name ASC
`;

const findById = `
    SELECT id, user_id, name, ceremony, created_at, updated_at
    FROM categories
    WHERE id = $1 AND user_id = $2
`;

const findByNameAndCeremony = `
    SELECT id, user_id, name, ceremony, created_at, updated_at
    FROM categories
    WHERE user_id = $1
      AND LOWER(name) = LOWER($2)
      AND LOWER(ceremony) = LOWER($3)
    LIMIT 1
`;

const create = `
    INSERT INTO categories (user_id, name, ceremony)
    VALUES ($1, $2, $3)
    RETURNING id, user_id, name, ceremony, created_at, updated_at
`;

const update = `
    UPDATE categories
    SET
        name    = COALESCE($1, name),
        ceremony = COALESCE($2, ceremony)
    WHERE id = $3 AND user_id = $4
    RETURNING id, user_id, name, ceremony, created_at, updated_at
`;

const remove = `
    DELETE FROM categories
    WHERE id = $1 AND user_id = $2
`;

const CategoriesQueries = {
    findAll,
    findById,
    findByNameAndCeremony,
    create,
    update,
    remove,
};

export default CategoriesQueries;
