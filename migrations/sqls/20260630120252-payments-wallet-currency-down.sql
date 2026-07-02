ALTER TABLE payments
    ADD COLUMN wallet_currency VARCHAR(50) NOT NULL DEFAULT 'NGN';

ALTER TABLE payments
    DROP COLUMN user_currency_id;