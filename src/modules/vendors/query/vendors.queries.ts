const findAll = `
    SELECT id, user_id, name, phone, email, website, created_at, updated_at
    FROM vendors
    WHERE user_id = $1
      AND ($2::text IS NULL OR name ILIKE '%' || $2 || '%')
    ORDER BY name ASC
`;

const findById = `
    SELECT id, user_id, name, phone, email, website, created_at, updated_at
    FROM vendors
    WHERE id = $1 AND user_id = $2
`;

const findByName = `
    SELECT id, user_id, name, phone, email, website, created_at, updated_at
    FROM vendors
    WHERE user_id = $1 AND LOWER(name) = LOWER($2)
    LIMIT 1
`;

const create = `
    INSERT INTO vendors (user_id, name, phone, email, website)
    VALUES ($1, $2, $3, $4, $5)
    RETURNING id, user_id, name, phone, email, website, created_at, updated_at
`;

const update = `
    UPDATE vendors
    SET
        name    = COALESCE($1, name),
        phone   = COALESCE($2, phone),
        email   = COALESCE($3, email),
        website = COALESCE($4, website)
    WHERE id = $5 AND user_id = $6
    RETURNING id, user_id, name, phone, email, website, created_at, updated_at
`;

const remove = `
    DELETE FROM vendors
    WHERE id = $1 AND user_id = $2
`;

const VendorsQueries = { findAll, findById, findByName, create, update, remove };

export default VendorsQueries;
