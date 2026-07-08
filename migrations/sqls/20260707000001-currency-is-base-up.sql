ALTER TABLE user_currencies
    ADD COLUMN is_base BOOLEAN NOT NULL DEFAULT FALSE;

CREATE UNIQUE INDEX idx_user_currencies_one_base
    ON user_currencies (user_id) WHERE is_base = TRUE;

ALTER TABLE client_currencies
    ADD COLUMN is_base BOOLEAN NOT NULL DEFAULT FALSE;

CREATE UNIQUE INDEX idx_client_currencies_one_base
    ON client_currencies (client_id) WHERE is_base = TRUE;
