const register = `
    INSERT INTO users (first_name, last_name, email, password, account_type)
    VALUES ($1, $2, $3, $4, $5)
    RETURNING id, first_name, last_name, email, account_type, base_currency,
              event_name, event_date, wedding_location, created_at
`;

const findByEmail = `
    SELECT id, first_name, last_name, email, password,
           account_type, base_currency, event_name, event_date, wedding_location, created_at
    FROM users
    WHERE email = $1
`;

const findById = `
    SELECT id, first_name, last_name, email,
           account_type, base_currency, event_name, event_date, wedding_location, created_at
    FROM users
    WHERE id = $1
`;

const updateOnboarding = `
    UPDATE users
    SET base_currency = $1, event_name = $2, event_date = $3, wedding_location = $4
    WHERE id = $5
    RETURNING id, first_name, last_name, email,
              account_type, base_currency, event_name, event_date, wedding_location, created_at
`;

const bulkInsertCeremonies = (count: number): string => {
    const values = Array.from({ length: count }, (_, i) => `($1, $${i + 2})`).join(', ');
    return `INSERT INTO ceremonies (user_id, name) VALUES ${values}`;
};

const bulkInsertCurrencies = (count: number): string => {
    const values = Array.from({ length: count }, (_, i) => `($1, $${i + 2})`).join(', ');
    return `
        INSERT INTO user_currencies (user_id, currency_code)
        VALUES ${values}
        ON CONFLICT (user_id, currency_code) DO NOTHING
    `;
};

const createResetToken = `
    INSERT INTO password_reset_tokens (user_id, token, expires_at)
    VALUES ($1, $2, NOW() + INTERVAL '1 hour')
    RETURNING *
`;

const findResetToken = `
    SELECT prt.*, u.email, u.first_name
    FROM password_reset_tokens prt
    JOIN users u ON u.id = prt.user_id
    WHERE prt.token = $1
    AND prt.expires_at > NOW()
`;

const deleteResetToken = `
    DELETE FROM password_reset_tokens
    WHERE token = $1
`;

const updatePassword = `
    UPDATE users
    SET password = $1
    WHERE id = $2
`;

const AuthQueries = {
    register,
    findByEmail,
    findById,
    updateOnboarding,
    bulkInsertCeremonies,
    bulkInsertCurrencies,
    createResetToken,
    findResetToken,
    deleteResetToken,
    updatePassword,
};

export default AuthQueries;