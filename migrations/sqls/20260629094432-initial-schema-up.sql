CREATE TABLE users (
    id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    first_name          VARCHAR(50) NOT NULL,
    last_name           VARCHAR(50) NOT NULL,
    email               VARCHAR(255) NOT NULL UNIQUE,
    password            VARCHAR(255) NOT NULL,
    partner_id          UUID UNIQUE REFERENCES users(id) ON DELETE SET NULL,
    account_type        VARCHAR(20) NOT NULL DEFAULT 'couple',
    base_currency       VARCHAR(3) NOT NULL DEFAULT 'NGN',
    event_name          VARCHAR(200),
    event_date          DATE,
    wedding_location    VARCHAR(100),
    created_at          TIMESTAMPTZ DEFAULT NOW(),
    updated_at          TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE vendors (
    id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id     UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    name        VARCHAR(100) NOT NULL,
    phone       VARCHAR(50),
    email       VARCHAR(255),
    website     VARCHAR(50),
    created_at  TIMESTAMPTZ DEFAULT NOW(),
    updated_at  TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE ceremonies (
    id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id     UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    name        VARCHAR(100) NOT NULL,
    created_at  TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE categories (
    id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id      UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    ceremony_id  UUID NOT NULL REFERENCES ceremonies(id) ON DELETE RESTRICT,
    name         VARCHAR(100) NOT NULL,
    created_at   TIMESTAMPTZ DEFAULT NOW(),
    updated_at   TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE expenses (
    id                UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id           UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    category_id       UUID NOT NULL REFERENCES categories(id),
    vendor_id         UUID REFERENCES vendors(id) ON DELETE SET NULL,
    ceremony_id       UUID NOT NULL REFERENCES ceremonies(id) ON DELETE RESTRICT,
    name              VARCHAR(100) NOT NULL,
    planned_amount    BIGINT,
    actual_amount     BIGINT,
    base_currency     VARCHAR(3) NOT NULL DEFAULT 'NGN',
    refundable_amount BIGINT NOT NULL DEFAULT 0,
    is_refunded       BOOLEAN NOT NULL DEFAULT FALSE,
    refunded_at       TIMESTAMPTZ,
    notes             TEXT,
    is_planned        BOOLEAN DEFAULT FALSE,
    created_at        TIMESTAMPTZ DEFAULT NOW(),
    updated_at        TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE payments (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    expense_id      UUID NOT NULL REFERENCES expenses(id) ON DELETE CASCADE,
    payment_type    VARCHAR(50) NOT NULL,
    wallet_amount   BIGINT NOT NULL,
    wallet_currency VARCHAR(50) NOT NULL,
    exchange_rate   BIGINT,
    base_amount     BIGINT NOT NULL,
    payment_date    TIMESTAMPTZ NOT NULL,
    notes           TEXT,
    created_at      TIMESTAMPTZ DEFAULT NOW(),
    updated_at      TIMESTAMPTZ DEFAULT NOW(),
    deleted_at      TIMESTAMPTZ
);

CREATE TABLE exchange_rates (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    from_currency   VARCHAR(50) NOT NULL,
    to_currency     VARCHAR(50) NOT NULL,
    rate            BIGINT NOT NULL,
    source          VARCHAR(50) NOT NULL,
    fetched_at      TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE password_reset_tokens (
    id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id     UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    token       VARCHAR(255) NOT NULL UNIQUE,
    expires_at  TIMESTAMPTZ NOT NULL,
    created_at  TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE user_currencies (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id         UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    currency_code   VARCHAR(3) NOT NULL,
    created_at      TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(user_id, currency_code)
);


CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER set_updated_at_users
    BEFORE UPDATE ON users
    FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER set_updated_at_vendors
    BEFORE UPDATE ON vendors
    FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER set_updated_at_categories
    BEFORE UPDATE ON categories
    FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER set_updated_at_expenses
    BEFORE UPDATE ON expenses
    FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER set_updated_at_payments
    BEFORE UPDATE ON payments
    FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- Indexes
CREATE INDEX idx_expenses_user_ceremony    ON expenses    (user_id, ceremony_id);
CREATE INDEX idx_expenses_user_id          ON expenses    (user_id);
CREATE INDEX idx_payments_expense_active   ON payments    (expense_id) WHERE deleted_at IS NULL;
CREATE INDEX idx_categories_user_ceremony  ON categories  (user_id, ceremony_id);
CREATE INDEX idx_vendors_user_id           ON vendors     (user_id);
CREATE INDEX idx_ceremonies_user_id        ON ceremonies  (user_id);
CREATE INDEX idx_user_currencies_user_id   ON user_currencies (user_id);
