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

const findById = `
    SELECT id, user_id, currency_code, created_at
    FROM user_currencies
    WHERE user_id = $1 AND id = $2
`;

// $1 = client_id | $2 = user_id (ownership check)
const findByClientId = `
    SELECT cl.currency_code AS id, cl.currency_code, true AS is_base
    FROM clients cl
    WHERE cl.id = $1 AND cl.user_id = $2
    UNION ALL
    SELECT cc.currency_code AS id, cc.currency_code, false AS is_base
    FROM client_currencies cc
    JOIN clients c ON c.id = cc.client_id
    WHERE cc.client_id = $1 AND c.user_id = $2
    ORDER BY is_base DESC, id ASC
`;

// $1 = client_id | $2 = currency_code
const upsertClientCurrency = `
    INSERT INTO client_currencies (client_id, currency_code)
    VALUES ($1, $2)
    ON CONFLICT (client_id, currency_code) DO NOTHING
`;

// $1 = client_id
const deleteClientCurrencies = `DELETE FROM client_currencies WHERE client_id = $1`;

const CurrenciesQueries = { findAll, findById, findByCode, add, remove, findByClientId, upsertClientCurrency, deleteClientCurrencies };

export default CurrenciesQueries;
