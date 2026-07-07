const findAll = `
    SELECT u.base_currency AS id, u.id::text AS user_id, u.base_currency AS currency_code, u.created_at
    FROM users u
    WHERE u.id = $1
    UNION ALL
    SELECT uc.id::text, uc.user_id::text, uc.currency_code, uc.created_at
    FROM user_currencies uc
    WHERE uc.user_id = $1
    UNION ALL
    SELECT ev.vendor_currency, $1::text, ev.vendor_currency, MIN(ev.created_at)
    FROM events ev
    WHERE ev.user_id = $1
      AND ev.vendor_currency IS NOT NULL
      AND ev.vendor_currency != (SELECT base_currency FROM users WHERE id = $1)
      AND ev.vendor_currency NOT IN (SELECT currency_code FROM user_currencies WHERE user_id = $1)
    GROUP BY ev.vendor_currency
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
