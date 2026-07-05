DROP TABLE IF EXISTS password_reset_tokens  CASCADE;
DROP TABLE IF EXISTS exchange_rates         CASCADE;
DROP TABLE IF EXISTS payments               CASCADE;
DROP TABLE IF EXISTS expenses               CASCADE;
DROP TABLE IF EXISTS categories             CASCADE;
DROP TABLE IF EXISTS events                 CASCADE;
DROP TABLE IF EXISTS client_currencies      CASCADE;
DROP TABLE IF EXISTS user_currencies        CASCADE;
DROP TABLE IF EXISTS clients                CASCADE;
DROP TABLE IF EXISTS vendors                CASCADE;
DROP TABLE IF EXISTS users                  CASCADE;

DROP FUNCTION IF EXISTS update_updated_at CASCADE;
