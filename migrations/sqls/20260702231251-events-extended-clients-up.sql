-- Add new columns to events table
ALTER TABLE events ADD COLUMN event_type      VARCHAR(50);
ALTER TABLE events ADD COLUMN date            DATE;
ALTER TABLE events ADD COLUMN location        VARCHAR(200);
ALTER TABLE events ADD COLUMN vendor_currency VARCHAR(3);
ALTER TABLE events ADD COLUMN budget          BIGINT;

-- Clients table (for planner account type)
CREATE TABLE clients (
    id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id       UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    first_name    VARCHAR(100) NOT NULL,
    last_name     VARCHAR(100) NOT NULL,
    currency_code VARCHAR(3) NOT NULL,
    created_at    TIMESTAMPTZ DEFAULT NOW(),
    updated_at    TIMESTAMPTZ DEFAULT NOW()
);

-- Link events to a client (planner-managed events have client_id set)
ALTER TABLE events ADD COLUMN client_id UUID REFERENCES clients(id) ON DELETE SET NULL;
