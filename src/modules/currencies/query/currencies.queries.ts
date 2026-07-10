// $1 = user_id
const findAll = `
    SELECT id::text, user_id::text, currency_code, is_base, created_at
    FROM user_currencies
    WHERE user_id = $1
    ORDER BY is_base DESC, created_at ASC
`;

const findByCode = `
    SELECT id, user_id, currency_code, is_base, created_at
    FROM user_currencies
    WHERE user_id = $1 AND currency_code = $2
`;

const add = `
    INSERT INTO user_currencies (user_id, currency_code, is_base)
    VALUES ($1, $2, FALSE)
    RETURNING id, user_id, currency_code, is_base, created_at
`;

const remove = `
    DELETE FROM user_currencies
    WHERE user_id = $1 AND currency_code = $2 AND is_base = FALSE
`;

const findById = `
    SELECT id, user_id, currency_code, is_base, created_at
    FROM user_currencies
    WHERE user_id = $1 AND id = $2
`;

// $1 = client_id | $2 = user_id (ownership check)
const findByClientId = `
    SELECT cc.id::text, cc.client_id::text AS user_id, cc.currency_code, cc.is_base, cc.created_at
    FROM client_currencies cc
    JOIN clients c ON c.id = cc.client_id
    WHERE cc.client_id = $1 AND c.user_id = $2
    ORDER BY cc.is_base DESC, cc.created_at ASC
`;

// $1 = client_id | $2 = currency_code
const upsertClientCurrency = `
    INSERT INTO client_currencies (client_id, currency_code, is_base)
    VALUES ($1, $2, FALSE)
    ON CONFLICT (client_id, currency_code) DO NOTHING
`;

// $1 = user_id | $2 = currency_code (non-base, silent if already exists)
const upsertUserCurrency = `
    INSERT INTO user_currencies (user_id, currency_code, is_base)
    VALUES ($1, $2, FALSE)
    ON CONFLICT (user_id, currency_code) DO NOTHING
`;

// $1 = client_id | $2 = currency_code (base)
const insertClientBaseWallet = `
    INSERT INTO client_currencies (client_id, currency_code, is_base)
    VALUES ($1, $2, TRUE)
    ON CONFLICT (client_id, currency_code) DO UPDATE SET is_base = TRUE
`;

// $1 = client_id
const deleteClientCurrencies = `DELETE FROM client_currencies WHERE client_id = $1`;

const CurrenciesQueries = {
    findAll,
    findById,
    findByCode,
    add,
    remove,
    upsertUserCurrency,
    findByClientId,
    upsertClientCurrency,
    insertClientBaseWallet,
    deleteClientCurrencies,
};

export default CurrenciesQueries;
