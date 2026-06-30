-- Indexes
DROP INDEX IF EXISTS idx_user_currencies_user_id;
DROP INDEX IF EXISTS idx_ceremonies_user_id;
DROP INDEX IF EXISTS idx_vendors_user_id;
DROP INDEX IF EXISTS idx_categories_user_id;
DROP INDEX IF EXISTS idx_payments_expense_active;
DROP INDEX IF EXISTS idx_expenses_user_id;
DROP INDEX IF EXISTS idx_expenses_user_ceremony;

-- Tables (reverse dependency order)
DROP TABLE IF EXISTS user_currencies;
DROP TABLE IF EXISTS ceremonies;
DROP TABLE IF EXISTS password_reset_tokens;
DROP TABLE IF EXISTS exchange_rates;
DROP TABLE IF EXISTS payments;
DROP TABLE IF EXISTS expenses;
DROP TABLE IF EXISTS categories;
DROP TABLE IF EXISTS vendors;
DROP TABLE IF EXISTS users;

DROP FUNCTION IF EXISTS update_updated_at();
