DROP INDEX IF EXISTS idx_user_currencies_one_base;
ALTER TABLE user_currencies DROP COLUMN IF EXISTS is_base;

DROP INDEX IF EXISTS idx_client_currencies_one_base;
ALTER TABLE client_currencies DROP COLUMN IF EXISTS is_base;
