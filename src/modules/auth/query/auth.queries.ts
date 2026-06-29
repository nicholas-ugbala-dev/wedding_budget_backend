const register = `
    INSERT INTO users (first_name, last_name, email, password)
    VALUES ($1, $2, $3, $4)
    RETURNING id, first_name, last_name, email, base_currency, wedding_location, created_at
`;

const findByEmail = `
    SELECT id, first_name, last_name, email, password,
           base_currency, wedding_location, created_at
    FROM users
    WHERE email = $1
`;

const findById = `
    SELECT id, first_name, last_name, email, base_currency, wedding_location, created_at
    FROM users
    WHERE id = $1
`;

const updateOnboarding = `
    UPDATE users
    SET base_currency = $1, wedding_location = $2
    WHERE id = $3
    RETURNING id, first_name, last_name, email, base_currency, wedding_location, created_at
`;

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
    createResetToken,
    findResetToken,
    deleteResetToken,
    updatePassword,
};

export default AuthQueries;