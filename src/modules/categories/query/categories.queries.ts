const BASE_SELECT = `
    SELECT c.id, c.user_id, c.ceremony_id, cer.name AS ceremony_name,
           c.name, c.created_at, c.updated_at
    FROM categories c
    JOIN ceremonies cer ON cer.id = c.ceremony_id
`;

// $1 = user_id | $2 = ceremony_id (nullable UUID)
const findAll = `
    ${BASE_SELECT}
    WHERE c.user_id = $1
      AND ($2::uuid IS NULL OR c.ceremony_id = $2::uuid)
    ORDER BY cer.name ASC, c.name ASC
`;

// $1 = id | $2 = user_id
const findById = `
    ${BASE_SELECT}
    WHERE c.id = $1 AND c.user_id = $2
`;

// $1 = user_id | $2 = name | $3 = ceremony_id
const findByNameAndCeremony = `
    ${BASE_SELECT}
    WHERE c.user_id = $1
      AND LOWER(c.name) = LOWER($2)
      AND c.ceremony_id = $3::uuid
    LIMIT 1
`;

// $1 = user_id | $2 = ceremony_id | $3 = name
const create = `
    WITH inserted AS (
        INSERT INTO categories (user_id, ceremony_id, name)
        VALUES ($1, $2, $3)
        RETURNING id, user_id, ceremony_id, name, created_at, updated_at
    )
    SELECT i.id, i.user_id, i.ceremony_id, cer.name AS ceremony_name,
           i.name, i.created_at, i.updated_at
    FROM inserted i
    JOIN ceremonies cer ON cer.id = i.ceremony_id
`;

// $1 = name (nullable) | $2 = ceremony_id (nullable) | $3 = id | $4 = user_id
const update = `
    WITH updated AS (
        UPDATE categories
        SET
            name        = COALESCE($1, name),
            ceremony_id = COALESCE($2::uuid, ceremony_id)
        WHERE id = $3 AND user_id = $4
        RETURNING id, user_id, ceremony_id, name, created_at, updated_at
    )
    SELECT u.id, u.user_id, u.ceremony_id, cer.name AS ceremony_name,
           u.name, u.created_at, u.updated_at
    FROM updated u
    JOIN ceremonies cer ON cer.id = u.ceremony_id
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
