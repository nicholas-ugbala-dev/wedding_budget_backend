const findAll = `
    SELECT id, user_id, currency_code, created_at
    FROM user_currencies
    WHERE user_id = $1
    ORDER BY created_at ASC
`;

const findByCode = `
    SELECT id, user_id, currency_code, created_at
    FROM user_currencies
    WHERE user_id = $1 AND currency_code = $2
`;

const add = `
    INSERT INTO user_currencies (user_id, currency_code)
    VALUES ($1, $2)
    RETURNING id, user_id, currency_code, created_at
`;

const remove = `
    DELETE FROM user_currencies
    WHERE user_id = $1 AND currency_code = $2
`;

const CurrenciesQueries = { findAll, findByCode, add, remove };

export default CurrenciesQueries;
