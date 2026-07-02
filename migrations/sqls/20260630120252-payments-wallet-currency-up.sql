ALTER TABLE payments
    ADD COLUMN user_currency_id UUID REFERENCES user_currencies(id) ON DELETE RESTRICT;

ALTER TABLE payments
    DROP COLUMN wallet_currency;